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

export type TMDB_Info = {
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
