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

export type MultiSearchResults = SearchResultPerson | SearchResultMovie;
