import { Injectable } from '@nestjs/common';
import { CreditInfo } from 'src/types/credit';
import {
  TMDB_DiscoverMovieQuery,
  TMDB_DiscoveredMovieDetail,
  TMDB_MovieInfo,
  TMDB_DiscoveredMoviesList,
  TMDB_ReleaseDates,
  TMDB_WatchProviders,
  TMDB_WatchProvider,
  TMDB_Recommendations,
} from 'src/tmdb/tmdb.type';
import { getImage } from '../images/images.utils';
import {
  MovieInfoResDto,
  InterestingMovieIdsResDto,
  QueryParamsDto,
  MovieCredits,
} from './dto/movie.dto';
import { CacheService } from '../cache/cache.service';
import { Cacheable } from '../cache/cacheable.decorator';
import { SortOption } from '../common/types/media-query';
import { extractYearFromDate } from '../utils/dates';
import { TmdbService } from '../tmdb/tmdb.service';
import { RatingsService } from '../ratings/ratings.service';
import { ImagesService } from '../images/images.service';
import {
  findTrailerKey,
  formatCasts,
  formatCrew,
  formatDuration,
  formatGenres,
  emptyCredit,
} from '../utils/media';
import { PosterResDto } from '../common/dto/poster.dto';
import { Duration } from '../common/app.constants';

import { GENRES } from '../constants/items/genres.constant';
import { WatchProviders } from '../types/watch-provider';

@Injectable()
export class MovieService {
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly cacheService: CacheService,
    private readonly ratingsService: RatingsService,
    private readonly imagesService: ImagesService,
  ) {}

  async getDiscoveredMovies(
    query: QueryParamsDto,
    tmdbQuery?: TMDB_DiscoverMovieQuery,
  ): Promise<TMDB_DiscoveredMoviesList> {
    const response = await this.tmdbService.getDiscover<
      TMDB_DiscoveredMoviesList,
      TMDB_DiscoverMovieQuery
    >('movie', {
      ...tmdbQuery,
      ...(this.constructSortRelatedParams(
        query.sort,
      ) as Partial<TMDB_DiscoverMovieQuery>),
      ...(query.genres && {
        with_genres: query.genres.replaceAll(',', '|'),
      }),
      ...(query.personId && {
        with_people: query.personId,
      }),
      ...(query.languages && {
        with_original_language: query.languages.replaceAll(',', '|'),
      }),
      ...(query.decade && {
        'primary_release_date.gte': `${query.decade}-01-01`,
        'primary_release_date.lte': `${Number(query.decade) + 9}-12-31`,
      }),
      ...(query.tmdbRatings && {
        'vote_average.gte': Number(query.tmdbRatings.split(',')[0]),
        'vote_average.lte': Number(query.tmdbRatings.split(',')[1]),
      }),
      page: query.page ?? 1,
    });
    const validMovies = response.results.filter((movie) =>
      this.isMovieValid(movie),
    );
    return {
      ...response,
      results: validMovies,
    };
  }

  async getInterestingMovieIds(
    query: Pick<QueryParamsDto, 'page' | 'sort'>,
  ): Promise<InterestingMovieIdsResDto> {
    const discoveredMovies = await this.getDiscoveredMovies(query, {
      'vote_count.gte': 50,
      'with_runtime.gte': 30,
    });

    const data = {
      ...discoveredMovies,
      results: discoveredMovies.results.map((movie) => movie.id),
    };

    return data;
  }

  async getBasicMovieInfo<T>(
    id: number,
    append_to_response: string = '',
  ): Promise<T> {
    return this.tmdbService.getDetails<T>('movie', id, append_to_response);
  }

  @Cacheable({
    key: (id: number) => `movie-info-${id}`,
    ttl: Duration.ONE_DAY,
  })
  async getMovieInfo(id: number): Promise<MovieInfoResDto> {
    const item = await this.getBasicMovieInfo<TMDB_MovieInfo>(
      id,
      'videos,release_dates,credits,watch/providers',
    );

    const posterPath = getImage(item.poster_path, 'movie_poster');
    const [blurhash, primaryColorHex] = await Promise.all([
      this.imagesService.generateRealBlurhash({ imageUrl: posterPath }),
      this.imagesService.generatePrimaryColorHex(posterPath),
    ]);
    const posterProps = { blurhash, primaryColorHex };
    const ratings = await this.ratingsService.getRatings(
      'movie',
      id,
      item.vote_average,
    );

    const data: MovieInfoResDto = {
      title: item.title,
      screeningStatus: this.screeningStatus(
        item.release_date,
        item.release_dates,
      ),
      overview: item.overview || 'N/A',
      posterPath,
      duration: formatDuration(item.runtime),
      certification: this.findCertification(item.release_dates),
      trailerKey: findTrailerKey(item.videos),
      genres: formatGenres(item.genres),
      ratings,
      posterProps,
      credits: this.constructMovieCredits(item.credits),
      watchProviders: this.constructWatchProviders(item['watch/providers']),
    };

    return data;
  }

  constructMovieCredits(credits: TMDB_MovieInfo['credits']): MovieCredits {
    const casts = formatCasts(credits.cast);
    const crew = formatCrew(credits.crew);
    const director = this.findDirector(credits);
    return { casts, crew, director };
  }

  private constructWatchProviders(
    watchProviders: TMDB_WatchProviders,
    country: string = 'US',
  ): WatchProviders {
    const data = watchProviders.results[country];
    if (!data) return { flatrate: [], rent: [], buy: [], tmdbLink: '' };

    const mapProvider = (p: TMDB_WatchProvider) => ({
      logoPath: getImage(p.logo_path, 'watch_provider'),
      providerId: p.provider_id,
      providerName: p.provider_name,
    });

    return {
      flatrate: (data.flatrate || []).map(mapProvider),
      rent: (data.rent || []).map(mapProvider),
      buy: (data.buy || []).map(mapProvider),
      tmdbLink: data.link || '',
    };
  }

  @Cacheable({
    key: (id: number, page: number = 1) =>
      `movie-recommendations-${id}-p${page}`,
    ttl: Duration.ONE_DAY,
  })
  async getMovieRecommendations(
    id: number,
    page: number = 1,
  ): Promise<PosterResDto> {
    const response = await this.tmdbService.getRecommendations<
      TMDB_Recommendations<TMDB_DiscoveredMovieDetail>
    >('movie', id, page);
    return this.constructRecommendations(response);
  }

  private constructRecommendations(
    recommendations: TMDB_Recommendations<TMDB_DiscoveredMovieDetail>,
  ): PosterResDto {
    const results = recommendations.results.map((movie) =>
      this.mapToMoviePoster(movie),
    );
    return {
      results,
      page: recommendations.page,
      total_pages: recommendations.total_pages,
      total_results: recommendations.total_results,
    };
  }

  private findDirector(credits: TMDB_MovieInfo['credits']): CreditInfo {
    const director = credits.crew
      .filter((crew) => crew.job === 'Director')
      .sort((a, b) => a.popularity - b.popularity)
      .slice(0, 1)
      .map((crew) => ({
        id: crew.id,
        name: crew.name,
        role: crew.job,
        creditId: crew.credit_id,
        profilePath: getImage(crew.profile_path, 'person'),
      }))[0];
    if (!director) {
      return emptyCredit;
    }
    return director;
  }

  async getMoviesPosters(query: QueryParamsDto): Promise<PosterResDto> {
    const discoveredMoviesList = await this.getDiscoveredMovies(query);
    const { results: movies, ...rest } = discoveredMoviesList;
    const results = movies.map((movie) => this.mapToMoviePoster(movie));
    return { results, ...rest };
  }

  private mapToMoviePoster(movie: TMDB_DiscoveredMovieDetail) {
    const posterPath = getImage(movie.poster_path, 'movie_poster');
    const blurhash = this.imagesService.generatePlaceholderBlurhash({
      id: movie.id,
    });

    return {
      id: movie.id,
      posterPath,
      blurhash,
      mediaType: 'movie' as const,
      preview: {
        title: movie.title,
        overview: movie.overview,
        genres: GENRES.filter((genre) => movie.genre_ids.includes(genre.id)),
      },
    };
  }

  private isMovieValid(movie: TMDB_DiscoveredMovieDetail): boolean {
    return Boolean(movie.title && movie.overview);
  }

  private findCertification(
    releaseDates: TMDB_ReleaseDates,
    country: string = 'US',
  ) {
    const certification =
      releaseDates.results.find((result) => result.iso_3166_1 === country)
        ?.release_dates[0].certification || 'N/A';

    return certification;
  }

  private screeningStatus(
    releaseDate: string,
    releaseDates: TMDB_ReleaseDates,
    country: string = 'US',
  ): string {
    const fallback = extractYearFromDate(releaseDate);
    const data = releaseDates.results.find(
      (result) => result.iso_3166_1 === country,
    );

    if (!data) return fallback;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Check for Premiere Event (Type 1) - STRICTLY TODAY
    const premiere = data.release_dates.find((d) => d.type === 1);
    if (premiere) {
      const premiereDate = new Date(premiere.release_date);
      if (premiereDate.toDateString() === today.toDateString()) {
        return 'Premiere';
      }
    }

    // 2. Find the EARLIEST Public Release (Types 2, 3, 4, 5, 6)
    // We filter out Type 1 (Premiere) because that doesn't count as "publicly released".
    const publicReleases = data.release_dates
      .filter((d) => d.type >= 2 && d.type <= 6)
      .sort(
        (a, b) =>
          new Date(a.release_date).getTime() -
          new Date(b.release_date).getTime(),
      );

    if (publicReleases.length === 0) return fallback;

    const firstRelease = publicReleases[0];
    const firstReleaseDate = new Date(firstRelease.release_date);

    // 3. Upcoming Check (Applies to ANY release type)
    if (firstReleaseDate > today) {
      return 'Upcoming';
    }

    // 4. In Cinemas Check (Only applies if it WAS a theatrical release)
    // We still need to find the specific theatrical entry to check the 60-day window.
    const theatricalRelease =
      data.release_dates.find((d) => d.type === 3) ||
      data.release_dates.find((d) => d.type === 2);

    if (theatricalRelease) {
      const theatricalDate = new Date(theatricalRelease.release_date);
      const diffTime = today.getTime() - theatricalDate.getTime();
      const daysSinceRelease = diffTime / (1000 * Duration.ONE_DAY);

      if (daysSinceRelease >= 0 && daysSinceRelease <= 60) {
        return 'In cinemas';
      }
    }

    return extractYearFromDate(firstRelease.release_date);
  }

  private constructSortRelatedParams(sort: SortOption) {
    switch (sort) {
      case SortOption.RANDOM:
        return {
          sort_by: 'vote_count.desc',
        };
      case SortOption.NEWEST:
        return {
          sort_by: 'primary_release_date.desc',
        };
      case SortOption.POPULARITY:
        return {
          sort_by: 'popularity.desc',
          'vote_average.gte': 7,
          'vote_count.gte': 300,
        };
      default:
        return {
          sort_by: sort,
        };
    }
  }
}
