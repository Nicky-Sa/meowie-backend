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
  TMDB_MovieImages,
  TMDB_MovieInfo,
  TMDB_MoviesList,
} from 'src/models/thirdparty/tmdb';
import {
  RATING_SOURCES,
  Whatson_MediaItem,
} from 'src/models/thirdparty/whatson';
import { findTrailerKey, formatDuration } from 'src/movies/utils';
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
  POSTER_FALLBACK_URL,
  TMDB_BASE_URL,
  PERSON_FALLBACK_URL,
} from '../utils/constants';
import pLimit from 'p-limit';
import { extractYearFromDate } from '../utils/functions/dates';
import { getGenreEmoji } from './models/genres.model';
import { SortOption } from './models/query.model';
import { RatingEntry } from './models/ratings.model';

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

  constructor(private readonly env: EnvService) {
    this.TMDB_API_KEY = this.env.get('TMDB_API_KEY');
  }

  async getPurifiedMovieIds(
    query: Pick<QueryParamsDto, 'page' | 'sort'>,
  ): Promise<PurifiedMovieIdsResDto> {
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
          with_original_language: 'en|fr|de|es',
          'vote_average.gte': 7,
          page: query.page ?? 1,
        },
      },
    );
    const validMovieIds = response.data.results
      .filter((movie) => this.isMovieValid(movie))
      .map((movie) => movie.id);

    const data = {
      page: response.data.page,
      results: validMovieIds,
      total_pages: response.data.total_pages,
      total_results: response.data.total_results,
    };

    return data;
  }

  async getMovieInfo(id: number): Promise<MovieInfoResDto> {
    const response = await axios.get<TMDB_MovieInfo>(
      `${TMDB_BASE_URL}/3/movie/${id}`,
      {
        params: {
          append_to_response: 'videos,release_dates',
          api_key: this.TMDB_API_KEY,
        },
      },
    );
    const item = response.data;

    const posterPath = getImage(item.poster_path, 'poster');
    const posterProps = await this.generatePosterProps(posterPath);
    const ratings = await this.getMovieRatings(id);
    const credits = await this.getMovieCredits(id);

    const data: MovieInfoResDto = {
      title: item.title,
      publishYear: extractYearFromDate(item.release_date),
      overview: item.overview,
      posterPath,
      duration: formatDuration(item.runtime),
      certification:
        item.release_dates.results.find((result) => result.iso_3166_1 === 'US')
          ?.release_dates[0].certification ?? 'N/A',
      trailerKey: findTrailerKey(item.videos),
      genres: item.genres.map((genre) => ({
        ...genre,
        emoji: getGenreEmoji(genre.id),
      })),
      ratings,
      posterProps,
      credits,
    };

    return data;
  }

  async getMovieRatings(id: number): Promise<RatingEntry[]> {
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
        value: this.cleanRating(item.rotten_tomatoes?.critics_rating, '%'),
      });

      // 3. Metacritic Ⓜ️
      // Prioritizing Critics Rating (Metascore)
      ratings.push({
        source: 'Metacritic',
        value: this.cleanRating(item.metacritic?.critics_rating),
      });

      // 4. TMDB 🎬
      ratings.push({
        source: 'TMDB',
        value: this.cleanRating(item.tmdb?.users_rating),
      });
    } catch {
      ratings = RATING_SOURCES.map((source) => ({
        source,
        value: 'N/A',
      }));
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

  async getMovieIds(query: QueryParamsDto): Promise<PurifiedMovieIdsResDto> {
    const response = await axios.get<TMDB_MoviesList>(
      `${TMDB_BASE_URL}/3/discover/movie`,
      {
        params: {
          api_key: this.TMDB_API_KEY,
          include_adult: false,
          sort_by: 'vote_count.desc',
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
        },
      },
    );
    const item = response.data;

    const validMovieIds = item.results
      .filter((movie) => this.isMovieValid(movie))
      .map((movie) => movie.id);

    return {
      page: item.page,
      results: validMovieIds,
      total_pages: item.total_pages,
      total_results: item.total_results,
    };
  }

  async getMoviesPoster(
    movieIds: PurifiedMovieIdsResDto,
  ): Promise<MoviePosterResDto> {
    const { results: ids, ...rest } = movieIds;
    // Avoid bombarding TMDB by limiting the number of concurrent requests
    const limit = pLimit(5);

    const moviePromises = ids.map((id) =>
      limit(async () => {
        return this.getMoviePosterSingle(id);
      }),
    );
    // Waits for all to finish (success or fail)
    const allResults = await Promise.allSettled(moviePromises);

    // Filter only the successful ones and extract the data
    // Remove explicit nulls if any
    const results = allResults
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value)
      .filter((data) => data !== null);

    return { results, ...rest };
  }

  private async getMoviePosterSingle(id: number): Promise<MoviePosterInfo> {
    const response = await axios.get<TMDB_MovieImages>(
      `${TMDB_BASE_URL}/3/movie/${id}/images`,
      {
        params: {
          api_key: this.TMDB_API_KEY,
        },
      },
    );
    const item = response.data;

    const posterPath =
      item.posters.length > 0 && item.posters[0].file_path
        ? getImage(item.posters[0].file_path, 'poster')
        : POSTER_FALLBACK_URL;
    const { blurhash } = await this.generatePosterProps(posterPath, {
      blurhash: true,
      hex: false,
    });
    const data = {
      id,
      posterPath,
      blurhash,
    };
    return data;
  }

  private isMovieValid(movie: TMDB_MovieDetail): boolean {
    return Boolean(movie.title && movie.overview);
  }

  private async generatePosterProps(
    url: string,
    options: {
      hex?: boolean;
      blurhash?: boolean;
    } = { hex: true, blurhash: true },
  ): Promise<PosterProps> {
    let primaryColorHex = '#1F3854';
    let blurhash = 'U6PZfSi_.AyE_3t7t7R**0o#DgR4_3R*D%xs';

    // If both are false, return defaults immediately without fetching
    if (!options.hex && !options.blurhash) {
      return { primaryColorHex, blurhash };
    }

    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');

      if (options.hex) {
        const hex = await this.getPrimaryColorHex(buffer);
        if (hex) {
          primaryColorHex = hex;
        }
      }

      if (options.blurhash) {
        const hash = await this.getBlurhash(buffer);
        if (hash) {
          blurhash = hash;
        }
      }
    } catch (error) {
      if (error instanceof AggregateError) {
        this.logger.error(
          `AggrigateError generating poster props: ${error.message}\n`,
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

  private cleanRating(
    rating: number | undefined,
    postfix: string = '',
  ): string {
    if (typeof rating !== 'number') return 'N/A';
    return Math.floor(rating * 10) / 10 + postfix; // truncate to 1 decimal place
  }
}
