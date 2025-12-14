import { AllRatings } from '../models/ratings';
import { PosterProps } from '../models/image';
import { Credits, MovieDetails } from '../models/movie-info';

export type MovieInfoResDto = MovieDetails &
  AllRatings & {
    posterProps: PosterProps;
  } & {
    credits: Credits;
  };

export type MovieIdsResDto = {
  page: number;
  results: number[];
  total_pages: number;
  total_results: number;
};

export type MoviePosterResDto = {
  id: number;
  posterPath: string;
  blurhash: string;
}[];
