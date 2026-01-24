import axios from 'axios';
import { EnvService } from 'src/env/env.service';
import { Injectable, Logger } from '@nestjs/common';
import {
  CastInfo,
  Credits,
  MoviePosterInfo,
} from 'src/movies/models/movie-info.model';
import {
  TMDB_MovieCredits,
  TMDB_MovieDetail,
  TMDB_MovieInfo,
  TMDB_MoviesList,
} from 'src/models/thirdparty/tmdb';
import {
  RATING_SOURCES,
  Whatson_MediaItem,
} from 'src/models/thirdparty/whatson';
import {
  cleanRating,
  findCertification,
  findTrailerKey,
  formatDuration,
  screeningStatus,
} from 'src/movies/utils';
import { Vibrant } from 'node-vibrant/node';
import { getImage, PosterProps } from './models/image.model';
import sharp from 'sharp';
import { encode } from 'blurhash';
import {
  PurifiedMovieIdsResDto,
  MovieInfoResDto,
  MoviePosterResDto,
  QueryParamsDto,
} from './dto/movies.dto';
import {
  WHATSON_BASE_URL,
  TMDB_BASE_URL,
  PERSON_FALLBACK_URL,
} from '../utils/constants';
import pLimit from 'p-limit';
import { getGenreEmoji } from './models/genres.model';
import { SortOption } from './models/query.model';
import { RatingEntry } from './models/ratings.model';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class MoviesService {
  private readonly TMDB_API_KEY: string;
  private readonly logger = new Logger();
  private readonly emptyCast: CastInfo = {
    id: -1,
    name: 'N/A',
    character: '',
    creditId: '',
    profilePath: PERSON_FALLBACK_URL,
  };

  constructor(
    private readonly env: EnvService,
    private readonly cacheService: CacheService,
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

  async getPurifiedMovieIds(
    query: Pick<QueryParamsDto, 'page' | 'sort'>,
  ): Promise<PurifiedMovieIdsResDto> {
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
  async getBasicMovieInfo<T>(
    id: number,
    append_to_response: string = '',
  ): Promise<T> {
    const cacheKey = `movie-basic-info-${id}-${append_to_response}`;
    const cachedData = await this.cacheService.get<T>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const response = await axios.get<T>(`${TMDB_BASE_URL}/3/movie/${id}`, {
      params: {
        api_key: this.TMDB_API_KEY,
        ...(append_to_response && { append_to_response }),
      },
    });
    const item = response.data;
    await this.cacheService.set(cacheKey, item, 3600 * 24); // 24h TTL
    return item;
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

  async getMovieInfo(id: number): Promise<MovieInfoResDto> {
    const cacheKey = `movie-info-${id}`;
    const cachedData = await this.cacheService.get<MovieInfoResDto>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const item = await this.getBasicMovieInfo<TMDB_MovieInfo>(
      id,
      'videos,release_dates',
    );

    const posterPath = getImage(item.poster_path, 'poster');
    const posterProps = await this.generatePosterProps(posterPath);
    const ratings = await this.getMovieRatings(id, item.vote_average);
    const credits = await this.getMovieCredits(id);

    const data: MovieInfoResDto = {
      title: item.title,
      screeningStatus: screeningStatus(item.release_date, item.release_dates),
      overview: item.overview || 'N/A',
      posterPath,
      duration: formatDuration(item.runtime),
      certification: findCertification(item.release_dates),
      trailerKey: findTrailerKey(item.videos),
      genres: item.genres.map((genre) => ({
        ...genre,
        emoji: getGenreEmoji(genre.id),
      })),
      ratings,
      posterProps,
      credits,
    };

    await this.cacheService.set(cacheKey, data, 3600 * 24); // 24h TTL

    return data;
  }

  async getMovieRatings(
    id: number,
    tmdbVoteAverage: number,
  ): Promise<RatingEntry[]> {
    let ratings: RatingEntry[] = [];

    try {
      const response = await axios.get<Whatson_MediaItem>(
        `${WHATSON_BASE_URL}/movie/${id}`,
      );
      const item = response.data;
      // 1. IMDb ⭐
      ratings.push({
        source: 'IMDb',
        value: item.imdb?.users_rating ? `${item.imdb.users_rating}` : 'N/A',
      });

      // 2. Rotten Tomatoes 🍅
      // Prioritizing Critics' Rating (Tomatometer)
      ratings.push({
        source: 'Rotten Tomatoes',
        value: cleanRating(item.rotten_tomatoes?.critics_rating, '%'),
      });

      // 3. Metacritic Ⓜ️
      // Prioritizing Critics Rating (Metascore)
      ratings.push({
        source: 'Metacritic',
        value: cleanRating(item.metacritic?.critics_rating),
      });

      // 4. TMDB 🎬
      ratings.push({
        source: 'TMDB',
        value: cleanRating(item.tmdb?.users_rating || tmdbVoteAverage),
      });
    } catch {
      ratings = RATING_SOURCES.map((source) => ({
        source,
        value: 'N/A',
      }));
      if (tmdbVoteAverage) {
        ratings.find((rating) => rating.source === 'TMDB')!.value =
          cleanRating(tmdbVoteAverage);
      }
    }
    return ratings;
  }

  async getMovieCredits(id: number): Promise<Credits> {
    const response = await axios.get<TMDB_MovieCredits>(
      `${TMDB_BASE_URL}/3/movie/${id}/credits`,
      {
        params: {
          api_key: this.TMDB_API_KEY,
        },
      },
    );
    const item = response.data;

    // 1. Deduplicate first using a Map (Key = ID, Value = Object)
    const uniqueCastMap = new Map(item.cast.map((cast) => [cast.id, cast]));
    // 2. Convert back to array and chain your logic
    const casts: CastInfo[] = [...uniqueCastMap.values()]
      .filter((cast) => cast.known_for_department === 'Acting')
      .sort((a, b) => a.order - b.order)
      .slice(0, 5)
      .map((cast) => ({
        id: cast.id,
        name: cast.name,
        character: `${cast.known_for_department}: ${cast.character}`,
        creditId: cast.credit_id,
        profilePath: getImage(cast.profile_path, 'person'),
      }));
    let director = item.crew
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
      director = this.emptyCast;
    }
    return { casts, director };
  }

  getMoviesPoster(moviesList: TMDB_MoviesList): MoviePosterResDto {
    const { results: movies, ...rest } = moviesList;

    const moviePosterInfoResults = movies.map((movie) =>
      this.getMoviePosterSingle(movie),
    );

    return { results: moviePosterInfoResults, ...rest };
  }

  private getMoviePosterSingle(movie: TMDB_MovieDetail): MoviePosterInfo {
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

  private async generatePosterProps(url: string): Promise<PosterProps> {
    const cacheKey = `poster-props-${url}`;
    const cachedData = await this.cacheService.get<PosterProps>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    let primaryColorHex = '#1F3854';
    let blurhash = 'U11o;?of00of00of00of00of00of00of00of';

    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');

      const [hexResult, blurhashResult] = await Promise.allSettled([
        this.getPrimaryColorHex(buffer),
        this.getBlurhash(buffer),
      ]);

      if (hexResult.status === 'fulfilled' && hexResult.value) {
        primaryColorHex = hexResult.value;
      }

      if (blurhashResult.status === 'fulfilled' && blurhashResult.value) {
        blurhash = blurhashResult.value;
      }

      // Save to Cache (30 Days)
      const dataToCache: PosterProps = { primaryColorHex, blurhash };
      await this.cacheService.set(cacheKey, dataToCache, 3600 * 24 * 30);

      return dataToCache;
    } catch (error) {
      if (error instanceof AggregateError) {
        this.logger.error(
          `AggregateError generating poster props: ${error.message}\n`,
          `Errors: ${error.errors.join('\n ')}`,
        );
      }
      this.logger.error(`Error generating poster props: ${error}`);
    }
    return {
      primaryColorHex,
      blurhash,
    };
  }

  private async getPrimaryColorHex(
    buffer: Buffer,
  ): Promise<string | undefined> {
    const palette = await Vibrant.from(buffer).getPalette();
    return palette.LightVibrant?.hex;
  }

  private async getBlurhash(buffer: Buffer): Promise<string | undefined> {
    const { data, info } = await sharp(buffer)
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: 'inside' })
      .toBuffer({ resolveWithObject: true });

    return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
  }
}
