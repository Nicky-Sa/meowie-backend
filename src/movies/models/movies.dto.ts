import { TMDB_RequiredInfo } from './tmdb/info';
import { AllRatings } from './ratings';
import { PosterProps } from './image';
import { TMDB_MoviesList } from './tmdb/moviesList';

export type MoviesDTO = TMDB_RequiredInfo &
  AllRatings & {
    posterProps: PosterProps;
  };

export type MovieIdsDTO = TMDB_MoviesList;
