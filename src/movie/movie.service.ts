import { Injectable } from '@nestjs/common';
import { CastInfo } from 'src/types/cast';
import {
  TMDB_DiscoverMovieQuery,
  TMDB_DiscoveredMovieDetail,
  TMDB_MovieInfo,
  TMDB_DiscoveredMoviesList,
  TMDB_ReleaseDates,
} from 'src/tmdb/tmdb.type';
import { getImage, mapToPosters } from '../images/images.utils';
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
  formatDuration,
  formatGenres,
  emptyCast,
} from '../utils/media';
import { PosterResDto } from '../common/dto/poster.dto';
import { CacheDuration } from '../cache/cache.constants';

@Injectable()
export class MovieService {
  constructor(
    private readonly tmdb: TmdbService,
    private readonly cacheService: CacheService,
    private readonly ratingsService: RatingsService,
    private readonly imagesService: ImagesService,
  ) {}

  async getDiscoveredMovies(
    query: QueryParamsDto,
    tmdbQuery?: TMDB_DiscoverMovieQuery,
  ): Promise<TMDB_DiscoveredMoviesList> {
    const response = await this.tmdb.getDiscover<
      TMDB_DiscoveredMoviesList,
      TMDB_DiscoverMovieQuery
    >('movie', {
      sort_by: this.constructSort(query.sort),
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
      ...tmdbQuery,
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

  // based on append_to_response, the return type can differ
  @Cacheable({
    key: (id: number, append_to_response = '') =>
      `movie-basic-info-${id}-{${append_to_response}}`,
    ttl: CacheDuration.ONE_DAY,
  })
  async getBasicMovieInfo<T>(
    id: number,
    append_to_response: string = '',
  ): Promise<T> {
    return this.tmdb.getDetails<T>('movie', id, append_to_response);
  }

  @Cacheable({
    key: (id: number) => `movie-info-${id}`,
    ttl: CacheDuration.ONE_DAY,
  })
  async getMovieInfo(id: number): Promise<MovieInfoResDto> {
    const item = await this.getBasicMovieInfo<TMDB_MovieInfo>(
      id,
      'videos,release_dates,credits',
    );

    const posterPath = getImage(item.poster_path, 'poster');
    const posterProps =
      await this.imagesService.generatePosterProps(posterPath);
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
    };

    return data;
  }

  constructMovieCredits(credits: TMDB_MovieInfo['credits']): MovieCredits {
    const casts = formatCasts(credits.cast);
    const director = this.findDirector(credits);
    return { casts, director };
  }

  private findDirector(credits: TMDB_MovieInfo['credits']): CastInfo {
    const director = credits.crew
      .filter((crew) => crew.job === 'Director')
      .sort((a, b) => a.popularity - b.popularity)
      .slice(0, 1)
      .map((crew) => ({
        id: crew.id,
        name: crew.name,
        character: crew.job,
        creditId: crew.credit_id,
        profilePath: getImage(crew.profile_path, 'person'),
      }))[0];
    if (!director) {
      return emptyCast;
    }
    return director;
  }

  getMoviesPosters(moviesList: TMDB_DiscoveredMoviesList): PosterResDto {
    const { results: movies, ...rest } = moviesList;
    return { results: mapToPosters(movies), ...rest };
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
      const daysSinceRelease = diffTime / (1000 * 60 * 60 * 24);

      if (daysSinceRelease >= 0 && daysSinceRelease <= 60) {
        return 'In cinemas';
      }
    }

    return extractYearFromDate(firstRelease.release_date);
  }

  private constructSort(sort: SortOption) {
    switch (sort) {
      case SortOption.RANDOM:
        return 'vote_count.desc';
      case SortOption.NEWEST:
        return 'primary_release_date.desc';
      case SortOption.POPULARITY:
        return 'popularity.desc';
      default:
        return sort;
    }
  }
}
