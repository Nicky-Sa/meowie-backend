import { Genre } from '../../constants/items/genres.constant';

export type SearchResultPerson = {
  id: number;
  name: string;
  mediaType: 'person';
  knownForDepartment: string;
  profilePath: string;
};

export type SearchResultMovie = {
  id: number;
  title: string;
  posterPath: string;
  mediaType: 'movie';
  genres: string[];
  releaseYear: string;
};

export type SearchResultGenre = Genre & {
  mediaType: 'genre';
};

export type MultiSearchResults =
  | SearchResultPerson
  | SearchResultMovie
  | SearchResultGenre;
