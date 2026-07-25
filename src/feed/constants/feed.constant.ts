import { Duration } from '@/common/app.constants';
import { EXPLORE_LEVELS } from '@/taste/constants/journey.constant';
import { FeedCandidateSource } from '@/feed/types/feed.types';
import { MediaType } from '@/types/media-type';

export const FEED_PAGE_SIZE = 20;
export const DISCOVER_PAGES_PER_BUILD = 3;
export const MAX_SIMILAR_SOURCES = 5;
export const MAX_POOL_SIZE = 500;
export const MAX_FEED_PAGE = MAX_POOL_SIZE / FEED_PAGE_SIZE;
export const VOTE_COUNT_FLOOR = 50;
export const POPULAR_VOTE_COUNT_FLOOR = 100;
export const MIN_MOVIE_RUNTIME = 30;

export const STATE_TTL = Duration.ONE_HOUR * 6;
export const SHOWN_TTL = Duration.ONE_DAY * 7;

// Taste clears these too, so both modules must build them from one place.
export const feedCacheKeys = (userId: number, mediaType: MediaType) => {
  const base = `feed:${userId}:${mediaType}`;
  return {
    state: `${base}:state`,
    alreadyShown: `${base}:shown`,
  };
};

export type FeedCacheKeys = ReturnType<typeof feedCacheKeys>;

// Commitment → movie runtime window on taste discovery (spec values). Series
// have no runtime/seasons at discover time, so commitment is movies-only.
export const SHORT_MAX_RUNTIME = 100;
export const LONG_MIN_RUNTIME = 150;

// TMDB popularity at or above this gets the full crowd-boost score.
export const POPULARITY_FOR_FULL_SCORE = 100;
// Ratings only count fully once a title has at least this many votes.
export const VOTE_COUNT_FOR_FULL_CONFIDENCE = 300;
// Discover floor for the critics-choice taste query.
export const CRITICS_CHOICE_MIN_RATING = 7.4;

const TOP_EXPLORE_LEVEL = EXPLORE_LEVELS.length - 1;

/** `tight` is explore level 0 ("Stick to what I love"), `loose` is the top level. */
const blend = (tight: number, loose: number, exploreLevel: number): number => {
  const level = Math.min(Math.max(exploreLevel, 0), TOP_EXPLORE_LEVEL);
  return tight + ((loose - tight) * level) / TOP_EXPLORE_LEVEL;
};

export type RankingWeights = {
  genreMatch: number;
  era: number;
  reality: number;
  authority: number;
  quality: number;
  shuffle: number;
};

// Explore level tunes how tightly ranking hugs taste: low → strong genre and
// answer boosts, almost no shuffle; high → looser matching, more shuffle.
export const rankingWeightsFor = (exploreLevel: number): RankingWeights => ({
  genreMatch: blend(1.3, 0.6, exploreLevel),
  era: blend(0.5, 0.15, exploreLevel),
  reality: blend(0.5, 0.15, exploreLevel),
  authority: blend(0.5, 0.15, exploreLevel),
  quality: 0.6,
  shuffle: blend(0.05, 0.6, exploreLevel),
});

type SourceShares = Record<FeedCandidateSource, number>;

// A couple of liked titles must not steer the feed: the similar share grows
// with how many the user has, and is full from this count on.
const SIMILAR_SHARE = 0.2;
const LIKED_TITLES_FOR_FULL_SIMILAR_SHARE = 10;

// How the feed splits between sources: mostly taste discovery, a slice of
// similar titles, and always some popular titles so no single signal owns the
// feed. Higher explore levels hand more of it to popular.
export const sourceSharesFor = (
  exploreLevel: number,
  likedCount: number,
): SourceShares => {
  const taste = blend(0.7, 0.45, exploreLevel);
  const popular = blend(0.1, 0.35, exploreLevel);
  const similar =
    SIMILAR_SHARE *
    Math.min(likedCount / LIKED_TITLES_FOR_FULL_SIMILAR_SHARE, 1);

  // The share too few liked titles can't claim goes back to taste discovery.
  return { taste: taste + (SIMILAR_SHARE - similar), similar, popular };
};
