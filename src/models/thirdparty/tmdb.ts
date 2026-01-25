import { PaginatedResponse } from '../paginated-results.model';

//--------------------------------------------------
// Movies

// /3/movie/${id}
type TMDB_BelongsToCollection = {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
};

export type TMDB_Genre = {
  id: number;
  name: string;
};

type TMDB_ProductionCompany = {
  id: number;
  logo_path?: string;
  name: string;
  origin_country: string;
};

type TMDB_ProductionCountry = {
  iso_3166_1: string;
  name: string;
};

type TMDB_SpokenLanguage = {
  english_name: string;
  iso_639_1: string;
  name: string;
};

export type TMDB_ReleaseDates = {
  results: { iso_3166_1: string; release_dates: TMDB_ReleaseDate[] }[];
};

type TMDB_ReleaseDate = {
  certification: string;
  descriptors: any[];
  iso_639_1: string;
  note: string;
  release_date: string;
  type: number;
};

export type TMDB_Videos = {
  results: {
    iso_639_1: string;
    iso_3166_1: string;
    name: string;
    key: string;
    site: string;
    size: number;
    type: string;
    official: boolean;
    published_at: string;
    id: string;
  }[];
};

export type TMDB_MovieInfo = {
  id: number;
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: TMDB_BelongsToCollection;
  budget: number;
  genres: TMDB_Genre[];
  homepage: string;
  imdb_id: string;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: TMDB_ProductionCompany[];
  production_countries: TMDB_ProductionCountry[];
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: TMDB_SpokenLanguage[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  release_dates: TMDB_ReleaseDates;
  videos: TMDB_Videos;
  credits: Omit<TMDB_MovieCredits, 'id'>;
};

// /3/movie/${id}/credits
type TMDB_Cast = {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path?: string;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
};

type TMDB_Crew = {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path?: string;
  credit_id: string;
  department: string;
  job: string;
};

export type TMDB_MovieCredits = {
  id: number;
  cast: TMDB_Cast[];
  crew: TMDB_Crew[];
};

// /3/person/${id}
export type TMDB_Person = {
  adult: boolean;
  also_known_as: string[];
  biography: string;
  birthday: string;
  deathday: any;
  gender: number;
  homepage: any;
  id: number;
  imdb_id: string;
  known_for_department: string;
  name: string;
  place_of_birth: string;
  popularity: number;
  profile_path: string;
};

// /3/discover/movie
export class TMDB_MoviesList extends PaginatedResponse<TMDB_MovieDetail> {
  declare results: TMDB_MovieDetail[];
}

export type TMDB_MovieDetail = {
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

// /3/movie/${id}/images
type TMDB_Image = {
  aspect_ratio: number;
  height: number;
  iso_639_1: string;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
};

export type TMDB_MovieImages = {
  backdrops: TMDB_Image[];
  id: number;
  logos: TMDB_Image[];
  posters: TMDB_Image[];
};

// /search/multi
// media_type: person
type SearchResultPerson = {
  adult: boolean;
  id: number;
  name: string;
  original_name: string;
  media_type: 'person';
  popularity: number;
  gender: number;
  known_for_department: string;
  profile_path: string | null;
  known_for: KnownFor[];
};

type KnownFor = {
  adult: boolean;
  backdrop_path: string;
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string;
  media_type: string;
  original_language: string;
  genre_ids: number[];
  popularity: number;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  origin_country: string[];
};

// media_type: movie
type SearchResultMovie = {
  adult: boolean;
  backdrop_path: string;
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string;
  media_type: 'movie';
  original_language: string;
  genre_ids: number[];
  popularity: number;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

export type TMDB_MultiSearchDetail = SearchResultPerson | SearchResultMovie;

export class TMDB_MultiSearch extends PaginatedResponse<TMDB_MultiSearchDetail> {
  declare results: TMDB_MultiSearchDetail[];
}

//--------------------------------------------------
// Series

// /3/discover/tv
export class TMDB_SeriesList extends PaginatedResponse<TMDB_SeriesDetail> {
  declare results: TMDB_SeriesDetail[];
}

export type TMDB_SeriesDetail = {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  first_air_date: string;
  name: string;
  vote_average: number;
  vote_count: number;
};

// /3/tv/${id}
export type TMDB_SeriesInfo = {
  adult: boolean;
  backdrop_path: string;
  created_by: CreatedBy[];
  episode_run_time: number[];
  first_air_date: string;
  genres: TMDB_Genre[];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: LastEpisodeToAir;
  name: string;
  next_episode_to_air: any;
  networks: Network[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: TMDB_ProductionCompany[];
  production_countries: TMDB_ProductionCountry[];
  seasons: Season[];
  spoken_languages: TMDB_SpokenLanguage[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
  videos: TMDB_Videos;
  credits: Omit<TMDB_MovieCredits, 'id'>;
  content_ratings: TMDB_ContentRatings;
};

type TMDB_ContentRatings = {
  results: ContentRating[];
};

type ContentRating = {
  descriptors: any[];
  iso_3166_1: string;
  rating: string;
};

type CreatedBy = {
  id: number;
  credit_id: string;
  name: string;
  original_name: string;
  gender: number;
  profile_path: string;
};

type LastEpisodeToAir = {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  episode_type: string;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string;
};

type Network = {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
};

type Season = {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  vote_average: number;
};
