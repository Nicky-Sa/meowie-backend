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
  videos: TMDB_Videos;
  release_dates: TMDB_ReleaseDates;
};

export type TMDB_MovieCredits = {
  id: number;
  cast: TMDB_Cast[];
  crew: TMDB_Crew[];
};

export type TMDB_Cast = {
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

export type TMDB_Crew = {
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

type TMDB_BelongsToCollection = {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
};

type TMDB_Genre = {
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

type TMDB_ReleaseDates = {
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

export type TMDB_MoviesListResult = {
  page: number;
  results: TMDB_MovieDetail[];
  total_pages: number;
  total_results: number;
};

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
