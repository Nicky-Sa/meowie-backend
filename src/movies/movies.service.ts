import axios, { AxiosResponse } from 'axios';
import { EnvService } from 'src/env/env.service';
import { Injectable } from '@nestjs/common';
import { TMDB_MoviesList } from 'src/movies/models/tmdb/moviesList';
import { TMDB_Info, TMDB_RequiredInfo } from 'src/movies/models/tmdb/info';
import { OMDB_Info, OMDB_Source } from 'src/movies/models/omdb/info';
import { findTrailerKey, formatDuration } from 'src/movies/utils';
import { AllRatings } from './models/ratings';

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

  async getMovieIds(page: number): Promise<TMDB_MoviesList> {
    try {
      const response = await axios.get<TMDB_MoviesList>(
        `${this.TMDB_BASE_URL}/3/discover/movie`,
        {
          params: {
            include_adult: false,
            sort_by: 'popularity.desc',
            api_key: this.TMDB_API_KEY,
            'vote_average.gte': 7,
            page,
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(`Error fetching movies ids: ${error}`);
    }
  }

  async getMovieInfo(id: number) {
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
      let omdbResult: AxiosResponse<OMDB_Info, any> | null = null;
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
        const data: TMDB_RequiredInfo & AllRatings = {
          // tmdb
          title: tmdbResult.data.title || '😾',
          publishYear: new Date(tmdbResult.data.release_date ?? 0)
            .getFullYear()
            .toString(),
          overview: tmdbResult.data.overview || omdbResult?.data?.Plot || '🐈',
          posterPath: tmdbResult.data.poster_path
            ? `https://image.tmdb.org/t/p/original${tmdbResult.data.poster_path}`
            : omdbResult?.data?.Poster ||
              'https://meowie-public.s3.eu-central-1.amazonaws.com/poster-fallback.png',
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
        };

        return {
          ...data,
        };
      }
    } catch (error) {
      throw new Error(`Error fetching movie info: ${error}`);
    }
  }
}
