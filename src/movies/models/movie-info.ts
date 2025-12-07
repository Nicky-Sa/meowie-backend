export type MovieDetails = {
  title: string;
  publishYear: string;
  duration: string;
  certification: string;
  trailerKey: string;
  posterPath: string;
  overview: string;
  genres: string[];
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
