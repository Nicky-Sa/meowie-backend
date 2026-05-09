import { Injectable } from '@nestjs/common';
import { CreditInfo } from '@/types/credit';
import {
  TMDB_DiscoverMovieQuery,
  TMDB_DiscoveredMovieDetail,
  TMDB_MovieInfo,
  TMDB_DiscoveredMoviesList,
  TMDB_ReleaseDates,
} from '@/tmdb/tmdb.type';
import { getImage } from '@/images/images.utils';
import {
  MovieInfoResDto,
  InterestingMovieIdsResDto,
  QueryParamsDto,
  MovieCredits,
} from '@/movie/dto/movie.dto';
import { CacheService } from '@/cache/cache.service';
import { Cacheable } from '@/cache/cacheable.decorator';
import { extractYearFromDate } from '@/utils/dates';
import { TmdbService } from '@/tmdb/tmdb.service';
import { RatingsService } from '@/ratings/ratings.service';
import { ImagesService } from '@/images/images.service';
import {
  findTrailerKey,
  formatCasts,
  formatCrew,
  formatDuration,
  formatGenres,
  emptyCredit,
} from '@/utils/media';
import { PosterResDto } from '@/common/dto/poster.dto';
import { Duration } from '@/common/app.constants';
import { GENRES } from '@/constants/items/genres.constant';
import { BaseMediaService } from '@/common/base-media.service';

@Injectable()
export class MovieService extends BaseMediaService {
  protected readonly mediaType = 'movie' as const;
  protected readonly tmdbMediaType = 'movie' as const;

  constructor(
    tmdbService: TmdbService,
    private readonly cacheService: CacheService,
    private readonly ratingsService: RatingsService,
    private readonly imagesService: ImagesService,
  ) {
    super(tmdbService);
  }

  async getDiscoveredMovies(
    query: QueryParamsDto,
    tmdbQuery?: TMDB_DiscoverMovieQuery,
  ): Promise<TMDB_DiscoveredMoviesList> {
    const response = await this.tmdbService.getDiscover<
      TMDB_DiscoveredMoviesList,
      TMDB_DiscoverMovieQuery
    >(
      'movie',
      this.constructDiscoveryParams(query, 'primary_release_date', tmdbQuery),
    );
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
    return await this.getInterestingIdsBase(() =>
      this.getDiscoveredMovies(query, {
        'vote_count.gte': 50,
        'with_runtime.gte': 30,
      }),
    );
  }

  async getBasicMovieInfo<T>(
    id: number,
    append_to_response: string = '',
  ): Promise<T> {
    return this.tmdbService.getDetails<T>('movie', id, append_to_response);
  }

  @Cacheable({
    key: (id: number, country: string) => `movie-info-${id}-${country}`,
    ttl: Duration.ONE_DAY,
  })
  async getMovieInfo(id: number, country: string): Promise<MovieInfoResDto> {
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

    const screeningStatus = this.screeningStatus(
      item.release_date,
      item.release_dates,
      country,
    );

    const data: MovieInfoResDto = {
      title: item.title,
      screeningStatus,
      overview: item.overview || 'N/A',
      posterPath,
      duration: formatDuration(item.runtime),
      certification: this.findCertification(item.release_dates, country),
      trailerKey: findTrailerKey(item.videos),
      genres: formatGenres(item.genres),
      ratings,
      posterProps,
      credits: this.constructMovieCredits(item.credits),
      watchProviders: this.constructWatchProviders(
        id,
        item['watch/providers'],
        country,
      ),
      ticketLink:
        screeningStatus === 'In cinemas' || screeningStatus === 'Upcoming'
          ? `https://www.google.com/search?q=${encodeURIComponent(item.title)}+showtimes`
          : undefined,
    };

    return data;
  }

  constructMovieCredits(credits: TMDB_MovieInfo['credits']): MovieCredits {
    const casts = formatCasts(credits.cast);
    const crew = formatCrew(credits.crew);
    const director = this.findDirector(credits);
    return { casts, crew, director };
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
    return await this.getRecommendationsBase<TMDB_DiscoveredMovieDetail>(
      id,
      page,
      (movie) => this.mapToMoviePoster(movie),
    );
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

  private findCertification(releaseDates: TMDB_ReleaseDates, country: string) {
    const certification =
      releaseDates.results.find((result) => result.iso_3166_1 === country)
        ?.release_dates[0]?.certification || 'N/A';

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
}
