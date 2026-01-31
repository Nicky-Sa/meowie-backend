export type Whatson_MediaItem = {
  _id: string; // Unique MongoDB identifier
  id: number; // TMDB ID
  item_type: 'movie' | 'tvshow';
  is_active: boolean;
  title: string;
  original_title: string;
  image: string;
  is_adult: boolean;
  certification: string;
  release_date: string;
  runtime: number; // Seconds
  tagline: string;
  trailer: string;
  seasons_number: number;
  status: string;
  updated_at: string;
  popularity_average: number;
  ratings_average: number;

  platforms_links?: PlatformLink[];
  episodes_details?: Episode[];
  last_episode?: Episode;
  next_episode?: Episode;
  highest_episode?: Episode;
  lowest_episode?: Episode;

  // External Providers
  allocine?: AllocineData;
  betaseries?: BetaSeriesData;
  imdb?: ImdbData;
  letterboxd?: LetterboxdData;
  metacritic?: MetacriticData;
  rotten_tomatoes?: RottenTomatoesData;
  senscritique?: SensCritiqueData;
  tmdb?: TmdbData;
  trakt?: TraktData;
  tv_time?: TvTimeData;
  thetvdb?: TheTvdbData;
  mojo?: BoxOfficeMojoData;
};

/**
 * Shared type for streaming platform links
 */
type PlatformLink = {
  name: string;
  link_url: string;
};

/**
 * Shared type for critic details (specifically for Allociné)
 */
type CriticDetail = {
  critic_name: string;
  critic_rating: number;
};

/**
 * Standardized type for Episode data.
 * Used for both individual episode details and summary objects (last/next/highest).
 */
type Episode = {
  season: number;
  episode: number;
  title: string;
  description: string;
  id: string; // IMDb specific identifier
  url: string;
  release_date: string;
  users_rating: number;
  users_rating_count: number;
  episode_type?: string; // Specific to next/last episode objects
};

// ------------------------------------------------------------------
// Provider / Platform Types
// ------------------------------------------------------------------

type AllocineData = {
  id: number;
  url: string;
  users_rating: number;
  users_rating_count: number;
  critics_rating: number;
  critics_rating_count: number;
  critics_rating_details?: CriticDetail[];
  popularity: number;
};

type BetaSeriesData = {
  id: string;
  url: string;
  users_rating: number;
  users_rating_count: number;
};

type ImdbData = {
  id: string;
  url: string;
  users_rating: number;
  users_rating_count: number;
  popularity: number;
  top_ranking: number;
};

type LetterboxdData = {
  id: string;
  url: string;
  users_rating: number;
  users_rating_count: number;
};

type MetacriticData = {
  id: string;
  url: string;
  users_rating: number;
  users_rating_count: number;
  critics_rating: number;
  critics_rating_count: number;
  must_see: boolean;
};

type RottenTomatoesData = {
  id: string;
  url: string;
  users_rating: number;
  users_rating_count: number;
  users_rating_liked_count: number;
  users_rating_not_liked_count: number;
  users_certified: boolean;
  critics_rating: number;
  critics_rating_count: number;
  critics_rating_liked_count: number;
  critics_rating_not_liked_count: number;
  critics_certified: boolean;
};

type SensCritiqueData = {
  id: number;
  url: string;
  users_rating: number;
  users_rating_count: number;
};

type TmdbData = {
  id: number;
  url: string;
  users_rating: number;
  users_rating_count: number;
  popularity: number;
};

type TraktData = {
  id: string | number;
  url: string;
  users_rating: number;
  users_rating_count: number;
};

type TvTimeData = {
  id: number;
  url: string;
  users_rating: number;
};

type TheTvdbData = {
  id: number;
  slug: string;
  url: string;
};

type BoxOfficeMojoData = {
  rank: number;
  url: string;
  lifetime_gross: number;
};
