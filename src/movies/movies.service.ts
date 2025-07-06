import axios, { AxiosResponse } from 'axios';
import { EnvService } from 'src/env/env.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  TMDB_MoviesList,
  TMDB_MoviesListResult,
} from 'src/movies/models/tmdb/moviesList';
import { TMDB_Info } from 'src/movies/models/tmdb/info';
import { OMDB_Info, OMDB_Source } from 'src/movies/models/omdb/info';
import { findTrailerKey, formatDuration, hasFilters } from 'src/movies/utils';
import { QueryParams } from './models/query';
import { min } from 'lodash';
import { Vibrant } from 'node-vibrant/node';
import { PosterProps } from './models/image';
import sharp from 'sharp';
import { encode } from 'blurhash';
import { MovieIdsDTO, MoviesDTO } from './models/movies.dto';

@Injectable()
export class MoviesService {
  private readonly TMDB_API_KEY: string;
  private readonly OMDB_API_KEY: string;
  private readonly TMDB_BASE_URL = 'https://api.themoviedb.org';
  private readonly OMDB_BASE_URL = 'http://www.omdbapi.com';

  constructor(private readonly envService: EnvService) {
    this.TMDB_API_KEY = this.envService.get('TMDB_API_KEY');
    this.OMDB_API_KEY = this.envService.get('OMDB_API_KEY');
  }

  async getMovieIds(query: QueryParams): Promise<MovieIdsDTO> {
    const maxDate = min([
      new Date(`${Number(query.decade) + 9}-12-31`),
      new Date(),
    ])
      ?.toISOString()
      .split('T')[0];
    try {
      const response = await axios.get<TMDB_MoviesList>(
        `${this.TMDB_BASE_URL}/3/discover/movie`,
        {
          params: {
            include_adult: false,
            sort_by: 'vote_count.desc',
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
      throw new Error(`Error fetching movies ids: ${error}`);
    }
  }

  async getMovieInfo(id: number): Promise<MoviesDTO> {
    try {
      // TMDB API
      const tmdbResult = await axios.get<TMDB_Info>(
        `${this.TMDB_BASE_URL}/3/movie/${id}`,
        {
          params: {
            append_to_response: 'videos,release_dates',
            api_key: this.TMDB_API_KEY,
          },
        },
      );

      // OMDB API
      const imdbId = tmdbResult.data?.imdb_id;
      let omdbResult: AxiosResponse<OMDB_Info> | null = null;
      let omdbRatings: {
        Source: OMDB_Source;
        Value: string;
      }[];

      try {
        omdbResult = imdbId
          ? await axios.get<OMDB_Info>(this.OMDB_BASE_URL, {
              params: {
                i: imdbId,
                apikey: this.OMDB_API_KEY,
              },
            })
          : null;
        if (omdbResult && omdbResult.data?.Ratings) {
          omdbRatings = omdbResult.data.Ratings;
        } else {
          throw new Error('No ratings found');
        }
      } catch {
        omdbRatings = (
          Object.keys({} as Record<OMDB_Source, unknown>) as OMDB_Source[]
        ).map((source) => ({
          Source: source,
          Value: 'N/A',
        }));
      }

      if (tmdbResult.data) {
        const posterPath = tmdbResult.data.poster_path
          ? `https://image.tmdb.org/t/p/original${tmdbResult.data.poster_path}`
          : 'https://meowie-public.s3.eu-central-1.amazonaws.com/poster-fallback.png';
        const posterProps = await this.generatePosterProps(posterPath);

        const data: MoviesDTO = {
          // tmdb
          title: tmdbResult.data.title,
          publishYear: new Date(tmdbResult.data.release_date ?? 0)
            .getFullYear()
            .toString(),
          overview: tmdbResult.data.overview,
          posterPath,
          duration: formatDuration(tmdbResult.data.runtime),
          certification:
            (tmdbResult.data.release_dates.results.find(
              (result) => result.iso_3166_1 === 'US',
            )?.release_dates[0].certification ||
              omdbResult?.data?.Rated) ??
            'N/A',
          trailerKey: findTrailerKey(tmdbResult.data.videos),
          genres: tmdbResult.data.genres.map((genre) => genre.name),
          ratings: [
            // omdb
            ...omdbRatings.map((rating) => ({
              source: rating.Source,
              value: rating.Value.split('/')[0].trim(),
            })),
            {
              source: 'The Movie Database',
              value: tmdbResult.data.vote_average.toFixed(1).toString(),
            },
          ],
          posterProps,
        };

        return {
          ...data,
        };
      } else {
        throw new HttpException('Movie not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new Error(`Error fetching movie info: ${error}`);
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
        console.error(
          `AggrigateError generating poster props: ${error.message}\n`,
          `Errors: ${error.errors.join('\n ')}`,
        );
      }
      console.error(`Error generating poster props: ${error}`);
    }
    return {
      primaryColorHex,
      blurhash,
    };
  }
}
