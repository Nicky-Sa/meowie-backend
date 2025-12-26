import { Genre } from '../../constants/items/genres.constant';

export type MovieDetails = {
  title: string;
  publishYear: string;
  duration: string;
  certification: string;
  trailerKey: string;
  posterPath: string;
  overview: string;
  genres: Genre[];
};

export type CastInfo = {
  id: number;
  name: string;
  character: string;
  profilePath: string;
};

export type Credits = {
  casts: CastInfo[];
  director: CastInfo;
};

export type MoviePosterInfo = {
  id: number;
  posterPath: string;
  blurhash: string;
};
