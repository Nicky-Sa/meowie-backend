import axios, { AxiosResponse } from 'axios';
import { EnvService } from 'src/env/env.service';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CastInfo, TMDB_MoviesListResult } from 'src/movies/models/movie-info';
import {
  TMDB_MovieCredits,
  TMDB_MovieInfo,
} from 'src/movies/models/thirdparty/tmdb';
import { OMDB_Info, OMDB_Source } from 'src/movies/models/thirdparty/omdb';
import { findTrailerKey, formatDuration, hasFilters } from 'src/movies/utils';
import { QueryParams } from './models/query';
import { min } from 'lodash';
import { Vibrant } from 'node-vibrant/node';
import { PosterProps } from './models/image';
import sharp from 'sharp';
import { encode } from 'blurhash';
import { MovieIdsResDto, MoviesResDto } from './dto/movies.dto';

@Injectable()
export class MoviesService {
  private readonly TMDB_API_KEY: string;
  private readonly OMDB_API_KEY: string;
  private readonly TMDB_BASE_URL = 'https://api.themoviedb.org';
  private readonly OMDB_BASE_URL = 'http://www.omdbapi.com';
  private readonly logger = new Logger();

  constructor(private readonly env: EnvService) {
    this.TMDB_API_KEY = this.env.get('TMDB_API_KEY');
    this.OMDB_API_KEY = this.env.get('OMDB_API_KEY');
  }

  async getMovieIds(query: QueryParams) {
    const maxDate = min([
      new Date(`${Number(query.decade) + 9}-12-31`),
      new Date(),
    ])
      ?.toISOString()
      .split('T')[0];
    try {
      const response = await axios.get<MovieIdsResDto>(
        `${this.TMDB_BASE_URL}/3/discover/movie`,
        {
          params: {
            include_adult: false,
            sort_by: 'popularity.desc',
            api_key: this.TMDB_API_KEY,
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
            page: query.page ?? 1,
          },
        },
      );
      response.data.results = response.data.results.filter((movie) =>
        this.isMovieValid(movie),
      );
      return response.data;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching movies ids: ${error}`,
      );
    }
  }

  async getMovieInfo(id: number) {
    try {
      // TMDB API
      const tmdbResponse = await axios.get<TMDB_MovieInfo>(
        `${this.TMDB_BASE_URL}/3/movie/${id}`,
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
          ? await axios.get<OMDB_Info>(this.OMDB_BASE_URL, {
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

      if (tmdbResponse.data) {
        const posterPath = tmdbResponse.data.poster_path
          ? `https://image.tmdb.org/t/p/original${tmdbResponse.data.poster_path}`
          : 'https://meowie-public.s3.eu-central-1.amazonaws.com/poster-fallback.png';
        const posterProps = await this.generatePosterProps(posterPath);
        const credits = await this.getMovieCredits(id);

        const data: MoviesResDto = {
          // tmdb
          title: tmdbResponse.data.title,
          publishYear: new Date(tmdbResponse.data.release_date ?? 0)
            .getFullYear()
            .toString(),
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

        return {
          ...data,
        };
      } else {
        throw new NotFoundException('Movie not found');
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching movie info: ${error}`,
      );
    }
  }

  async getMovieCredits(id: number) {
    try {
      const response = await axios.get<TMDB_MovieCredits>(
        `${this.TMDB_BASE_URL}/3/movie/${id}/credits`,
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
          name: cast.name,
          character: cast.character,
          profilePath: `https://image.tmdb.org/t/p/original${cast.profile_path}`,
        }));
      const director = response.data.crew
        .filter((crew) => crew.job === 'Director')
        .slice(0, 4)
        .map((crew) => ({
          name: crew.name,
          character: crew.job,
          profilePath: `https://image.tmdb.org/t/p/original${crew.profile_path}`,
        }))[0];
      return { casts, director };
    } catch (error) {
      throw new Error(`Error fetching movie credits: ${error}`);
    }
  }

  private isMovieValid(movie: TMDB_MoviesListResult): boolean {
    return Boolean(movie.title && movie.overview);
  }

  private async generatePosterProps(url: string): Promise<PosterProps> {
    let primaryColorHex = '#1F3854';
    let blurhash = 'U6PZfSi_.AyE_3t7t7R**0o#DgR4_3R*D%xs';

    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');

      const palette = await Vibrant.from(buffer).getPalette();

      // Generate blurhash
      const { data, info } = await sharp(buffer)
        .raw()
        .ensureAlpha()
        .resize(32, 32, { fit: 'inside' })
        .toBuffer({ resolveWithObject: true });

      const encodedBlurhash = encode(
        new Uint8ClampedArray(data),
        info.width,
        info.height,
        4,
        4,
      );
      if (palette.LightVibrant?.hex) {
        primaryColorHex = palette.LightVibrant.hex;
      }
      if (encodedBlurhash) {
        blurhash = encodedBlurhash;
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
}
