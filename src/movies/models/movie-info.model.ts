import { Genre } from '../../constants/items/genres.constant';

export class MovieDetails {
  title: string;
  publishYear: string;
  duration: string;
  certification: string;
  trailerKey: string;
  posterPath: string;
  overview: string;
  genres: Genre[];
}

export class CastInfo {
  id: number;
  name: string;
  character: string;
  profilePath: string;
}

export class Credits {
  casts: CastInfo[];
  director: CastInfo;
}

export class MoviePosterInfo {
  id: number;
  posterPath: string;
  blurhash: string;
}
