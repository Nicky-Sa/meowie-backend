import axios from 'axios';
import { EnvService } from 'src/env/env.service';
import { Injectable } from '@nestjs/common';
import { CastInfo, PosterInfo } from 'src/models/info.model';
import {
  TMDB_MovieDetail,
  TMDB_MovieInfo,
  TMDB_MoviesList,
  TMDB_ReleaseDates,
} from 'src/models/thirdparty/tmdb';
import { getImage } from '../models/image.model';
import {
  MovieInfoResDto,
  MoviePosterResDto,
  InterestingMovieIdsResDto,
  QueryParamsDto,
  MovieCredits,
} from './dto/movies.dto';
import { TMDB_BASE_URL } from '../utils/constants';
import pLimit from 'p-limit';
import { CacheService } from '../cache/cache.service';
import { Cacheable } from '../cache/cacheable.decorator';
import { SortOption } from '../models/shared-query.model';
import { MediaUtilsService } from '../media-utils/media-utils.service';
import { extractYearFromDate } from '../utils/functions/dates';

@Injectable()
export class MoviesService {
  private readonly TMDB_API_KEY: string;

  constructor(
    private readonly env: EnvService,
    private readonly cacheService: CacheService,
    private readonly mediaUtilsService: MediaUtilsService,
  ) {
    this.TMDB_API_KEY = this.env.get('TMDB_API_KEY');
  }

  async getDiscoveredMovies(
    query: QueryParamsDto,
    tmdbQuery?: Record<string, string | number>,
  ): Promise<TMDB_MoviesList> {
    // Sort defaults to popularity.desc by TMDB
    const sort =
      query.sort === SortOption.RANDOM ? 'vote_count.desc' : query.sort;

    const response = await axios.get<TMDB_MoviesList>(
      `${TMDB_BASE_URL}/3/discover/movie`,
      {
        params: {
          api_key: this.TMDB_API_KEY,
          include_adult: false,
          sort_by: sort,
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
            'vote_average.gte': query.tmdbRatings.split(',')[0],
            'vote_average.lte': query.tmdbRatings.split(',')[1],
          }),
          page: query.page ?? 1,
          ...tmdbQuery,
        },
      },
    );
    const validMovies = response.data.results.filter((movie) =>
      this.isMovieValid(movie),
    );
    return {
      ...response.data,
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
    ttl: 3600 * 24,
  })
  async getBasicMovieInfo<T>(
    id: number,
    append_to_response: string = '',
  ): Promise<T> {
    const response = await axios.get<T>(`${TMDB_BASE_URL}/3/movie/${id}`, {
      params: {
        api_key: this.TMDB_API_KEY,
        ...(append_to_response && { append_to_response }),
      },
    });
    return response.data;
  }

  async getBasicMovieInfoBulk<T>(
    ids: number[],
    append_to_response?: string,
  ): Promise<T[]> {
    // Avoid bombarding TMDB by limiting the number of concurrent requests
    const limit = pLimit(5);
    const moviePromises = ids.map((id) =>
      limit(() => {
        return this.getBasicMovieInfo<T>(id, append_to_response);
      }),
    );
    const allResults = await Promise.allSettled(moviePromises);
    const results = allResults
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value);
    return results;
  }

  @Cacheable({
    key: (id: number) => `movie-info-${id}`,
    ttl: 3600 * 24,
  })
  async getMovieInfo(id: number): Promise<MovieInfoResDto> {
    const item = await this.getBasicMovieInfo<TMDB_MovieInfo>(
      id,
      'videos,release_dates,credits',
    );

    const posterPath = getImage(item.poster_path, 'poster');
    const posterProps =
      await this.mediaUtilsService.generatePosterProps(posterPath);
    const ratings = await this.mediaUtilsService.getRatings(
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
      duration: this.mediaUtilsService.formatDuration(item.runtime),
      certification: this.findCertification(item.release_dates),
      trailerKey: this.mediaUtilsService.findTrailerKey(item.videos),
      genres: this.mediaUtilsService.formatGenres(item.genres),
      ratings,
      posterProps,
      credits: this.constructMovieCredits(item.credits),
    };

    return data;
  }

  constructMovieCredits(credits: TMDB_MovieInfo['credits']): MovieCredits {
    const casts = this.mediaUtilsService.formatCasts(credits.cast);
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
      return this.mediaUtilsService.emptyCast;
    }
    return director;
  }

  getMoviesPoster(moviesList: TMDB_MoviesList): MoviePosterResDto {
    const { results: movies, ...rest } = moviesList;

    const moviePosterInfoResults = movies.map((movie) =>
      this.getMoviePosterSingle(movie),
    );

    return { results: moviePosterInfoResults, ...rest };
  }

  private getMoviePosterSingle(movie: TMDB_MovieDetail): PosterInfo {
    const posterPath = getImage(movie.poster_path, 'poster');
    const blurhash = 'U11o;?of00of00of00of00of00of00of00of';
    const data = {
      id: movie.id,
      posterPath,
      blurhash,
    };
    return data;
  }

  private isMovieValid(movie: TMDB_MovieDetail): boolean {
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
}
