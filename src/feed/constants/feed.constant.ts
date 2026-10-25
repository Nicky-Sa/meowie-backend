import { MAX_FIT_SCORE } from '@/feed/engine/scoring/scoring.constants';

export const FEED_BATCH_SIZE = 20;
export const MIN_UNDELIVERED_TITLES = FEED_BATCH_SIZE * 2;
export const MAX_BATCHES_PER_REFILL = 5;
export const MIN_RATING_FOR_RECOMMENDATIONS = 8;
export const TASTE_WEIGHT = 20;
export const SAVED_TITLE_WEIGHT = 0.25;
// the "Good fit" level and above
export const MIN_FEED_SCORE = MAX_FIT_SCORE - 1;
// a rejected title up to half a point under MIN_FEED_SCORE is scored again, with a different random set of known titles
export const MIN_RETRY_SCORE = MIN_FEED_SCORE - 0.5;
export const MAX_TIMES_SCORED = 3;
export const MAX_RETRIES_PER_BATCH = 10;
export const MAX_DETAILS_AT_ONCE = 10;

export const DISCOVER_MIN_VOTE_COUNT = 100;
export const DISCOVER_MIN_VOTE_AVERAGE = 6;
export const DISCOVER_MIN_MOVIE_RUNTIME = 40; // minutes
export const TMDB_MAX_PAGE = 500; // TMDB rejects pages above this
