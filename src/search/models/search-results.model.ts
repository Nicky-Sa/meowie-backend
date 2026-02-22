import { Genre } from '../../constants/constants.dto';

export class SearchResultPerson {
  id: number;
  name: string;
  mediaType: 'person';
  knownForDepartment: string;
  profilePath: string;
}

export class SearchResultMovie {
  id: number;
  title: string;
  posterPath: string;
  mediaType: 'movie';
  genres: string[];
  releaseYear: string;
}

export class SearchResultMovieGenre extends Genre {
  mediaType: 'movie-genre';
}

export class SearchResultTvGenre extends Genre {
  mediaType: 'tv-genre';
}

export type MultiSearchResults =
  | SearchResultPerson
  | SearchResultMovie
  | SearchResultMovieGenre
  | SearchResultTvGenre;
