import { PaginatedResponse } from '../common/types/paginated-response';

export type TMDB_Genre = {
  id: number;
  name: string;
};
export type TMDB_GenresList = {
  genres: TMDB_Genre[];
};

export type TMDB_MediaType = 'movie' | 'tv';

//--------------------------------------------------
// Movie

// /3/movie/${id}
type TMDB_BelongsToCollection = {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
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

export type TMDB_WatchProvider = {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
};

export type TMDB_WatchProviders = {
  results: {
    [countryCode: string]: {
      link: string;
      flatrate?: TMDB_WatchProvider[];
      rent?: TMDB_WatchProvider[];
      buy?: TMDB_WatchProvider[];
    };
  };
};

export type TMDB_Recommendations = {
  page: number;
  results: TMDB_DiscoveredMovieDetail[];
  total_pages: number;
  total_results: number;
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
  credits: Omit<TMDB_MediaCredits, 'id'>;
  'watch/providers': TMDB_WatchProviders;
  recommendations: TMDB_Recommendations;
};

type TMDB_MediaCredits = {
  id: number;
  cast: TMDB_Cast[];
  crew: TMDB_Crew[];
};

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

// /3/person/${id}/combined_credits
export type TMDB_CombinedCredits = {
  cast: TMDB_CombinedCreditsCast[];
  crew: TMDB_CombinedCreditsCrew[];
  id: number;
};

export type TMDB_CombinedCreditsCast = {
  adult: boolean;
  backdrop_path?: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title?: string;
  overview: string;
  popularity: number;
  poster_path?: string;
  release_date?: string;
  title?: string;
  video?: boolean;
  vote_average: number;
  vote_count: number;
  character: string;
  credit_id: string;
  order?: number;
  media_type: TMDB_MediaType;
  origin_country?: string[];
  original_name?: string;
  first_air_date?: string;
  name?: string;
  episode_count?: number;
};

export type TMDB_CombinedCreditsCrew = {
  adult: boolean;
  backdrop_path?: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title?: string;
  overview: string;
  popularity: number;
  poster_path?: string;
  release_date?: string;
  title?: string;
  video?: boolean;
  vote_average: number;
  vote_count: number;
  credit_id: string;
  department: string;
  job: string;
  media_type: TMDB_MediaType;
  origin_country?: string[];
  original_name?: string;
  first_air_date?: string;
  name?: string;
  episode_count?: number;
};

// /3/discover/movie

export type TMDB_MovieSortOption =
  | 'original_title.asc'
  | 'original_title.desc'
  | 'popularity.asc'
  | 'popularity.desc'
  | 'revenue.asc'
  | 'revenue.desc'
  | 'primary_release_date.asc'
  | 'title.asc'
  | 'title.desc'
  | 'primary_release_date.desc'
  | 'vote_average.asc'
  | 'vote_average.desc'
  | 'vote_count.asc'
  | 'vote_count.desc';

export type TMDB_DiscoverSeriesQuery = {
  // --- CORE PARAMS ---
  /**
   * Specify the page of results to query.
   * @default 1
   */
  page?: number;

  /**
   * Specify a language to query translatable fields with.
   * Pattern: ISO 639-1 (e.g. 'en-US', 'es-ES')
   * @default 'en-US'
   */
  language?: string;

  /**
   * Choose a sort option for the list of results.
   * @default 'popularity.desc'
   */
  sort_by?: TMDB_SeriesSortOption;

  /**
   * Used in conjunction with the air_date.gte/lte filter to calculate the proper UTC offset.
   * @default "America/New_York"
   */
  timezone?: string;

  // --- FILTERS: AIR DATES ---
  /**
   * Filter and only include Series that have a first air date year
   * that is equal to the specified value.
   */
  first_air_date_year?: number;

  /**
   * Filter and only include Series that have a first air date
   * that is greater or equal to the specified value.
   * Format: YYYY-MM-DD
   */
  'first_air_date.gte'?: string;

  /**
   * Filter and only include Series that have a first air date
   * that is less than or equal to the specified value.
   * Format: YYYY-MM-DD
   */
  'first_air_date.lte'?: string;

  /**
   * Filter and only include Series that have an air date (for any episode)
   * that is greater or equal to the specified value.
   * Format: YYYY-MM-DD
   */
  'air_date.gte'?: string;

  /**
   * Filter and only include Series that have an air date (for any episode)
   * that is less than or equal to the specified value.
   * Format: YYYY-MM-DD
   */
  'air_date.lte'?: string;

  /**
   * Use this filter to include Series that don't have an air date
   * while using any of the "first_air_date" filters.
   * @default false
   */
  include_null_first_air_dates?: boolean;

  // --- FILTERS: RATINGS & VOTES ---
  /**
   * Filter and only include Series that have a vote count
   * that is greater or equal to the specified value.
   */
  'vote_count.gte'?: number;

  /**
   * Filter and only include Series that have a rating
   * that is greater or equal to the specified value.
   */
  'vote_average.gte'?: number;

  /**
   * Filter and only include Series that have a rating
   * that is less than or equal to the specified value.
   */
  'vote_average.lte'?: number;

  // --- FILTERS: GENRES & NETWORKS ---
  /**
   * Comma separated value of genre ids that you want to include in the results.
   * ',' = AND
   * '|' = OR
   */
  with_genres?: string;

  /**
   * Comma separated value of genre ids that you want to exclude from the results.
   */
  without_genres?: string;

  /**
   * Comma separated value of network ids that you want to include in the results.
   * ',' = OR
   * '|' = AND
   */
  with_networks?: string;

  /**
   * Comma separated value of keyword ids that you want to include in the results.
   */
  with_keywords?: string;

  /**
   * Comma separated value of keyword ids that you want to exclude from the results.
   */
  without_keywords?: string;

  // --- FILTERS: STATUS & TYPE ---
  /**
   * Comma separated value of status types to include.
   * 0: Returning Series
   * 1: Planned
   * 2: In Production
   * 3: Ended
   * 4: Canceled
   * 5: Pilot
   */
  with_status?: string;

  /**
   * Comma separated value of show types to include.
   * 0: Documentary
   * 1: News
   * 2: Miniseries
   * 3: Reality
   * 4: Scripted
   * 5: Talk Show
   * 6: Video
   */
  with_type?: string;

  /**
   * Filter and only include Series that have been screened theatrically.
   */
  screened_theatrically?: boolean;

  // --- FILTERS: CONTENT & ORIGIN ---
  /**
   * Filter and only include Series that have a runtime
   * that is greater or equal to a value (in minutes).
   */
  'with_runtime.gte'?: number;

  /**
   * Filter and only include Series that have a runtime
   * that is less than or equal to a value (in minutes).
   */
  'with_runtime.lte'?: number;

  /**
   * Specify an original language to filter results by.
   */
  with_original_language?: string;

  /**
   * Specify an origin country to filter results by.
   */
  with_origin_country?: string;

  /**
   * A comma-separated list of company IDs.
   */
  with_companies?: string;

  // --- FILTERS: STREAMING ---
  /**
   * A comma-separated list of Watch Provider IDs.
   * Used in conjunction with `watch_region`.
   */
  with_watch_providers?: string;

  /**
   * An ISO 3166-1 code. Defines the country to check for watch providers.
   * Required when using `with_watch_providers`.
   */
  watch_region?: string;

  /**
   * Filter by monetization type.
   */
  with_watch_monetization_types?: 'flatrate' | 'free' | 'ads' | 'rent' | 'buy';
};

export class TMDB_DiscoveredMoviesList extends PaginatedResponse<TMDB_DiscoveredMovieDetail> {
  declare results: TMDB_DiscoveredMovieDetail[];
}

export type TMDB_DiscoveredMovieDetail = {
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

// media_type: tv
type SearchResultSeries = {
  adult: boolean;
  backdrop_path: string;
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string;
  media_type: 'tv';
  original_language: string;
  genre_ids: number[];
  popularity: number;
  first_air_date: string;
  origin_country: string[];
  vote_average: number;
  vote_count: number;
};

export type TMDB_MultiSearchDetail =
  | SearchResultPerson
  | SearchResultMovie
  | SearchResultSeries;

export class TMDB_MultiSearch extends PaginatedResponse<TMDB_MultiSearchDetail> {
  declare results: TMDB_MultiSearchDetail[];
}

//--------------------------------------------------
// Series

// /3/discover/tv
export type TMDB_DiscoverMovieQuery = {
  // --- CORE PARAMS ---
  /**
   * Specify the page of results to query.
   * @default 1
   */
  page?: number;

  /**
   * Specify a language to query translatable fields with.
   * Pattern: ISO 639-1 (e.g. 'en-US', 'es-ES')
   * @default 'en-US'
   */
  language?: string;

  /**
   * Specify a region to query release dates and content ratings.
   * Pattern: ISO 3166-1 (e.g. 'US', 'DE')
   */
  region?: string;

  /**
   * Choose a sort option for the list of results.
   * @default 'popularity.desc'
   */
  sort_by?: TMDB_MovieSortOption;

  // --- FILTERS: CERTIFICATION & AUDIENCE ---
  /**
   * A filter and include or exclude items that have a certification.
   * Used in conjunction with `certification_country`.
   */
  certification?: string;

  /**
   * Filter and only include movies that have a certification that is
   * less than or equal to the specified value.
   */
  'certification.lte'?: string;

  /**
   * Filter and only include movies that have a certification that is
   * greater than or equal to the specified value.
   */
  'certification.gte'?: string;

  /**
   * Specify a country with a valid certification.
   * Used in conjunction with the `certification` filter.
   */
  certification_country?: string;

  /**
   * A filter to include or exclude adult movies.
   * @default false
   */
  include_adult?: boolean;

  /**
   * A filter to include or exclude videos.
   * @default false
   */
  include_video?: boolean;

  // --- FILTERS: DATES ---
  /**
   * A filter to include or exclude movies based on a primary release year.
   */
  primary_release_year?: number;

  /**
   * Filter and only include movies that have a primary release date
   * that is greater or equal to the specified value.
   * Format: YYYY-MM-DD
   */
  'primary_release_date.gte'?: string;

  /**
   * Filter and only include movies that have a primary release date
   * that is less than or equal to the specified value.
   * Format: YYYY-MM-DD
   */
  'primary_release_date.lte'?: string;

  /**
   * Filter and only include movies that have a release date (of any type)
   * that is greater or equal to the specified value.
   * Format: YYYY-MM-DD
   */
  'release_date.gte'?: string;

  /**
   * Filter and only include movies that have a release date (of any type)
   * that is less than or equal to the specified value.
   * Format: YYYY-MM-DD
   */
  'release_date.lte'?: string;

  /**
   * Specify a bitmask to filter release types.
   * 1: Premiere, 2: Theatrical (limited), 3: Theatrical, 4: Digital, 5: Physical, 6: TV
   * Example: 2|3 (Theatrical limited OR Theatrical)
   */
  with_release_type?: number | string;

  /**
   * A filter to include or exclude movies based on a year.
   * (Matches strictly the release year).
   */
  year?: number;

  // --- FILTERS: RATINGS ---
  /**
   * Filter and only include movies that have a vote count
   * that is greater or equal to the specified value.
   */
  'vote_count.gte'?: number;

  /**
   * Filter and only include movies that have a vote count
   * that is less than or equal to the specified value.
   */
  'vote_count.lte'?: number;

  /**
   * Filter and only include movies that have a rating
   * that is greater or equal to the specified value.
   */
  'vote_average.gte'?: number;

  /**
   * Filter and only include movies that have a rating
   * that is less than or equal to the specified value.
   */
  'vote_average.lte'?: number;

  // --- FILTERS: PEOPLE & COMPANIES ---
  /**
   * A comma-separated list of person IDs.
   * Only include movies that have one of the ID's added as a an actor.
   * Logic: OR (comma) / AND (pipe) logic varies by field, usually comma is OR for people.
   */
  with_cast?: string;

  /**
   * A comma-separated list of person IDs.
   * Only include movies that have one of the ID's added as a crew member.
   */
  with_crew?: string;

  /**
   * A comma-separated list of person IDs.
   * Only include movies that have one of the ID's added as a actor OR crew member.
   */
  with_people?: string;

  /**
   * A comma-separated list of production company IDs.
   * Only include movies that have one of the ID's added as a production company.
   */
  with_companies?: string;

  // --- FILTERS: GENRES & KEYWORDS ---
  /**
   * Comma separated value of genre ids that you want to include in the results.
   * ',' = AND (all genres must be present)
   * '|' = OR (at least one genre must be present)
   */
  with_genres?: string;

  /**
   * Comma separated value of genre ids that you want to exclude from the results.
   */
  without_genres?: string;

  /**
   * Comma separated value of keyword ids that you want to include in the results.
   * ',' = AND
   * '|' = OR
   */
  with_keywords?: string;

  /**
   * Comma separated value of keyword ids that you want to exclude from the results.
   */
  without_keywords?: string;

  // --- FILTERS: TECHNICAL & ORIGIN ---
  /**
   * Filter and only include movies that have a runtime
   * that is greater or equal to a value (in minutes).
   */
  'with_runtime.gte'?: number;

  /**
   * Filter and only include movies that have a runtime
   * that is less than or equal to a value (in minutes).
   */
  'with_runtime.lte'?: number;

  /**
   * Specify an original language to filter results by.
   */
  with_original_language?: string;

  /**
   * Specify an origin country to filter results by.
   * Pattern: ISO 3166-1 (e.g. 'US', 'KR')
   */
  with_origin_country?: string;

  // --- FILTERS: STREAMING (WATCH PROVIDERS) ---
  /**
   * A comma-separated list of Watch Provider IDs (e.g. 8 for Netflix).
   * Used in conjunction with `watch_region`.
   * ',' = OR
   * '|' = AND
   */
  with_watch_providers?: string;

  /**
   * An ISO 3166-1 code. Defines the country to check for watch providers.
   * Required when using `with_watch_providers`.
   */
  watch_region?: string;

  /**
   * Filter by monetization type.
   */
  with_watch_monetization_types?: 'flatrate' | 'free' | 'ads' | 'rent' | 'buy';
};

export type TMDB_SeriesSortOption =
  | 'first_air_date.asc'
  | 'first_air_date.desc'
  | 'name.asc'
  | 'name.desc'
  | 'original_name.asc'
  | 'original_name.desc'
  | 'popularity.asc'
  | 'popularity.desc'
  | 'vote_average.asc'
  | 'vote_average.desc'
  | 'vote_count.asc'
  | 'vote_count.desc';

export class TMDB_DiscoveredSeriesList extends PaginatedResponse<TMDB_DiscoveredSeriesDetail> {
  declare results: TMDB_DiscoveredSeriesDetail[];
}

export type TMDB_DiscoveredSeriesDetail = {
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

// /3/series/${id}
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
  last_air_date: string | null;
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
  status: 'Ended' | 'Returning Series';
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
  videos: TMDB_Videos;
  credits: Omit<TMDB_MediaCredits, 'id'>;
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

//--------------------------------------------------
// Query Params

export type TMDB_SearchQuery = {
  query: string;
  page?: number;
  include_adult?: boolean;
  region?: string;
  year?: number;
  primary_release_year?: number;
  first_air_date_year?: number;
};

//--------------------------------------------------
// Other

// /3/find/{external_id}
export type TMDB_FindByExternalId = {
  movie_results: TMDB_DiscoveredMovieDetail[];
  tv_results: TMDB_DiscoveredSeriesDetail[];
  person_results: unknown[];
  tv_episode_results: unknown[];
  tv_season_results: unknown[];
};
