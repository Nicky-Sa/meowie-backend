import { Genre } from '@/constants/constants.dto';

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

export class SearchResultSeries {
  id: number;
  title: string;
  posterPath: string;
  mediaType: 'series';
  genres: string[];
  firstAirDate: string;
}

export class SearchResultMovieGenre extends Genre {
  mediaType: 'movie-genre';
}

export class SearchResultSeriesGenre extends Genre {
  mediaType: 'series-genre';
}

export type MultiSearchResults =
  | SearchResultPerson
  | SearchResultMovie
  | SearchResultSeries
  | SearchResultMovieGenre
  | SearchResultSeriesGenre;
