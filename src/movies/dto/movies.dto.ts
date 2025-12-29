import { PosterProps } from '../models/image.model';
import { Credits, MoviePosterInfo } from '../models/movie-info.model';
import { Genre } from '../../constants/items/genres.constant';
import { RatingEntry } from '../models/ratings.model';

// Combines MovieDetails and AllRatings into one parent class
export class MovieInfoResDto {
  title: string;
  publishYear: string;
  duration: string;
  certification: string;
  trailerKey: string;
  posterPath: string;
  overview: string;
  genres: Genre[];
  posterProps: PosterProps;
  credits: Credits;
  ratings: RatingEntry[];
}

export class PurifiedMovieIdsResDto {
  page: number;
  results: number[];
  total_pages: number;
  total_results: number;
}

export class MoviePosterResDto {
  page: number;
  results: MoviePosterInfo[];
  total_pages: number;
  total_results: number;
}
