export const FEED_PAGE_SIZE = 20;
export const MAX_POOL_SIZE = 500;
export const MAX_FEED_PAGE = MAX_POOL_SIZE / FEED_PAGE_SIZE;
export const MIN_RATING_FOR_RECOMMENDATIONS = 8;
export const MAX_DETAILS_AT_ONCE = 10;
export const FEED_EXPIRY_SECONDS = 365 * 24 * 60 * 60; // 1 year

export const DISCOVER_MIN_VOTE_COUNT = 100;
export const DISCOVER_MIN_VOTE_AVERAGE = 6;
export const DISCOVER_MIN_MOVIE_RUNTIME = 40; // minutes
export const TMDB_MAX_PAGE = 500; // TMDB rejects pages above this
