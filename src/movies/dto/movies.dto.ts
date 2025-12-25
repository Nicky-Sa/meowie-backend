import { AllRatings } from '../models/ratings';
import { PosterProps } from '../models/image';
import { Credits, MovieDetails, MoviePosterInfo } from '../models/movie-info';

export type MovieInfoResDto = MovieDetails &
  AllRatings & {
    posterProps: PosterProps;
  } & {
    credits: Credits;
  };

export type PurifiedMovieIdsResDto = {
  page: number;
  results: number[];
  total_pages: number;
  total_results: number;
};

export type MoviePosterResDto = {
  page: number;
  results: MoviePosterInfo[];
  total_pages: number;
  total_results: number;
};
