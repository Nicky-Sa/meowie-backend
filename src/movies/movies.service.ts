import axios, { AxiosResponse } from 'axios';
import { EnvService } from 'src/env/env.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CastInfo,
  Credits,
  MoviePosterInfo,
} from 'src/movies/models/movie-info';
import {
  TMDB_MovieCredits,
  TMDB_MovieDetail,
  TMDB_MovieImages,
  TMDB_MovieInfo,
  TMDB_MoviesList,
} from 'src/models/thirdparty/tmdb';
import { OMDB_Info, OMDB_Source } from 'src/models/thirdparty/omdb';
import { findTrailerKey, formatDuration, hasFilters } from 'src/movies/utils';
import { QueryParams } from './models/query';
import { min } from 'lodash';
import { Vibrant } from 'node-vibrant/node';
import { getImage, PosterProps } from './models/image';
import sharp from 'sharp';
import { encode } from 'blurhash';
import {
  PurifiedMovieIdsResDto,
  MovieInfoResDto,
  MoviePosterResDto,
} from './dto/movies.dto';
import {
  OMDB_BASE_URL,
  POSTER_FALLBACK_URL,
  TMDB_BASE_URL,
} from '../utils/constants';
import pLimit from 'p-limit';
import { extractYearFromDate } from '../utils/functions/dates';

@Injectable()
export class MoviesService {
  private readonly TMDB_API_KEY: string;
  private readonly OMDB_API_KEY: string;
  private readonly logger = new Logger();
  private readonly emptyCast: CastInfo = {
    id: -1,
    name: 'N/A',
    character: '',
    profilePath: '',
  };

  constructor(private readonly env: EnvService) {
    this.TMDB_API_KEY = this.env.get('TMDB_API_KEY');
    this.OMDB_API_KEY = this.env.get('OMDB_API_KEY');
  }

  async getPurifiedMovieIds(
    query: QueryParams,
  ): Promise<PurifiedMovieIdsResDto> {
    const maxDate = min([
      new Date(`${Number(query.decade) + 9}-12-31`),
      new Date(),
    ])
      ?.toISOString()
      .split('T')[0];

    // Sort defaults to popularity.desc by TMDB
    const sort = query.sort === 'random' ? 'vote_count.desc' : query.sort;

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
          with_original_language: query.languages
            ? query.languages.replaceAll(',', '|')
            : 'en|fr|de|es',
          ...(query.decade && {
            'primary_release_date.gte': `${query.decade}-01-01`,
            'primary_release_date.lte': maxDate,
          }),
          'vote_average.gte': hasFilters(query)
            ? (query.tmdbRatings?.split(',')[0] ?? 0)
            : 7,
          'vote_average.lte': hasFilters(query)
            ? (query.tmdbRatings?.split(',')[1] ?? 10)
            : 10,
          with_people: query.personId,
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
    // TMDB API
    const tmdbResponse = await axios.get<TMDB_MovieInfo>(
      `${TMDB_BASE_URL}/3/movie/${id}`,
      {
        params: {
          append_to_response: 'videos,release_dates',
          api_key: this.TMDB_API_KEY,
        },
      },
    );

    // OMDB API
    const imdbId = tmdbResponse.data?.imdb_id;
    let omdbResponse: AxiosResponse<OMDB_Info> | null = null;
    let omdbRatings: {
      Source: OMDB_Source;
      Value: string;
    }[];

    try {
      omdbResponse = imdbId
        ? await axios.get<OMDB_Info>(OMDB_BASE_URL, {
            params: {
              i: imdbId,
              apikey: this.OMDB_API_KEY,
            },
          })
        : null;
      if (omdbResponse && omdbResponse.data?.Ratings) {
        omdbRatings = omdbResponse.data.Ratings;
      } else {
        throw new NotFoundException('No ratings found');
      }
    } catch {
      omdbRatings = (
        Object.keys({} as Record<OMDB_Source, unknown>) as OMDB_Source[]
      ).map((source) => ({
        Source: source,
        Value: 'N/A',
      }));
    }

    const posterPath = getImage(tmdbResponse.data.poster_path, 'poster');
    const posterProps = await this.generatePosterProps(posterPath);
    const credits = await this.getMovieCredits(id);

    const data: MovieInfoResDto = {
      // tmdb
      title: tmdbResponse.data.title,
      publishYear: extractYearFromDate(tmdbResponse.data.release_date),
      overview: tmdbResponse.data.overview,
      posterPath,
      duration: formatDuration(tmdbResponse.data.runtime),
      certification:
        (tmdbResponse.data.release_dates.results.find(
          (result) => result.iso_3166_1 === 'US',
        )?.release_dates[0].certification ||
          omdbResponse?.data?.Rated) ??
        'N/A',
      trailerKey: findTrailerKey(tmdbResponse.data.videos),
      genres: tmdbResponse.data.genres.map((genre) => genre.name),
      ratings: [
        // omdb
        ...omdbRatings.map((rating) => ({
          source: rating.Source,
          value: rating.Value.split('/')[0].trim(),
        })),
        {
          source: 'The Movie Database',
          value: tmdbResponse.data.vote_average.toFixed(1).toString(),
        },
      ],
      posterProps,
      credits,
    };

    return data;
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
    const casts: CastInfo[] = response.data.cast
      .filter((cast) => cast.known_for_department === 'Acting')
      .sort((a, b) => a.order - b.order)
      .slice(0, 5)
      .map((cast) => ({
        id: cast.id,
        name: cast.name,
        character: cast.character,
        profilePath: getImage(cast.profile_path, 'person'),
      }));
    let director = response.data.crew
      .filter((crew) => crew.job === 'Director')
      .slice(0, 1)
      .map((crew) => ({
        id: crew.id,
        name: crew.name,
        character: crew.job,
        profilePath: getImage(crew.profile_path, 'person'),
      }))[0];
    if (!director) {
      director = this.emptyCast;
    }
    return { casts, director };
  }

  async getMovieIds(query: QueryParams): Promise<PurifiedMovieIdsResDto> {
    const response = await axios.get<TMDB_MoviesList>(
      `${TMDB_BASE_URL}/3/discover/movie`,
      {
        params: {
          api_key: this.TMDB_API_KEY,
          include_adult: false,
          sort_by: 'vote_count.desc',
          with_people: query.personId,
          page: query.page ?? 1,
        },
      },
    );

    const validMovieIds = response.data.results
      .filter((movie) => this.isMovieValid(movie))
      .map((movie) => movie.id);

    return {
      page: response.data.page,
      results: validMovieIds,
      total_pages: response.data.total_pages,
      total_results: response.data.total_results,
    };
  }

  async getMoviesPoster(query: QueryParams): Promise<MoviePosterResDto> {
    const { results: ids, ...rest } = await this.getMovieIds(query);
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

    const posterPath =
      response.data.posters.length > 0 && response.data.posters[0].file_path
        ? getImage(response.data.posters[0].file_path, 'poster')
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
}
