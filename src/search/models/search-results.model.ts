import { Genre } from '../../constants/items/genres.constant';

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

export class SearchResultGenre extends Genre {
  mediaType: 'genre';
}

export type MultiSearchResults =
  | SearchResultPerson
  | SearchResultMovie
  | SearchResultGenre;
