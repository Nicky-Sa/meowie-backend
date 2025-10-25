import { AllRatings } from '../models/ratings';
import { PosterProps } from '../models/image';
import {
  Credits,
  TMDB_MoviesListResult,
  TMDB_RequiredInfo,
} from '../models/movie-info';

export type MoviesResDto = TMDB_RequiredInfo &
  AllRatings & {
    posterProps: PosterProps;
  } & {
    credits: Credits;
  };

export type MovieIdsResDto = {
  page: number;
  results: TMDB_MoviesListResult[];
  total_pages: number;
  total_results: number;
};
