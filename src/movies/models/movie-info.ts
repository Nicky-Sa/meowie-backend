export type TMDB_RequiredInfo = {
  title: string;
  publishYear: string;
  duration: string;
  certification: string;
  trailerKey: string;
  posterPath: string;
  overview: string;
  genres: string[];
};

export type TMDB_MoviesListResult = {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

export type CastInfo = {
  name: string;
  character: string;
  profilePath: string;
};

export type Credits = {
  casts: CastInfo[];
  director: string;
};
