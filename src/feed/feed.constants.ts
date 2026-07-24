import { Duration } from '@/common/app.constants';
import { EXPLORE_LEVELS } from '@/taste/constants/journey.constant';
import { FeedCandidateSource } from '@/feed/engine/engine.types';

export const FEED_PAGE_SIZE = 20;
export const DISCOVER_PAGES_PER_BUILD = 3;
export const MAX_SIMILAR_SOURCES = 5;
export const MAX_POOL_SIZE = 500;
export const VOTE_COUNT_FLOOR = 50;
export const POPULAR_VOTE_COUNT_FLOOR = 100;
export const MIN_MOVIE_RUNTIME = 30;

export const POOL_TTL = Duration.ONE_HOUR * 6;
export const STATE_TTL = Duration.ONE_HOUR * 6;
export const SERVED_TTL = Duration.ONE_DAY * 7;

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

/**
 * A value at explore level 0 ("Stick to what I love") and at the top level
 * ("Surprise me"); levels between blend linearly.
 */
type ExploreRange = { tight: number; loose: number };

const TOP_EXPLORE_LEVEL = EXPLORE_LEVELS.length - 1;

const blendByExploreLevel = (
  range: ExploreRange,
  exploreLevel: number,
): number => {
  const level = Math.min(Math.max(exploreLevel, 0), TOP_EXPLORE_LEVEL);
  return (
    range.tight + ((range.loose - range.tight) * level) / TOP_EXPLORE_LEVEL
  );
};

// Explore level tunes how tightly ranking hugs taste: low → strong genre and
// answer boosts, almost no shuffle; high → looser matching, more shuffle.
// A new scorer needs exactly one line here.
const SCORER_WEIGHT_RANGES = {
  genreMatch: { tight: 1.3, loose: 0.6 },
  era: { tight: 0.5, loose: 0.15 },
  reality: { tight: 0.5, loose: 0.15 },
  authority: { tight: 0.5, loose: 0.15 },
  quality: { tight: 0.6, loose: 0.6 },
  shuffle: { tight: 0.05, loose: 0.6 },
} satisfies Record<string, ExploreRange>;

export type ScorerKey = keyof typeof SCORER_WEIGHT_RANGES;

export type RankingWeights = Record<ScorerKey, number>;

export const rankingWeightsFor = (exploreLevel: number): RankingWeights => {
  const weights = {} as RankingWeights;
  for (const key of Object.keys(SCORER_WEIGHT_RANGES) as ScorerKey[]) {
    weights[key] = blendByExploreLevel(SCORER_WEIGHT_RANGES[key], exploreLevel);
  }
  return weights;
};

export type SourceShares = Record<FeedCandidateSource, number>;

// How the feed splits between candidate sources: mostly taste discovery, a
// slice of lookalikes, and always some popular titles so no single
// signal owns the feed. Higher explore levels hand more of it to popular.
const SOURCE_SHARE_RANGES: Record<FeedCandidateSource, ExploreRange> = {
  taste: { tight: 0.7, loose: 0.45 },
  similar: { tight: 0.2, loose: 0.2 },
  popular: { tight: 0.1, loose: 0.35 },
};

// A couple of liked titles must not steer the feed: the similar share grows
// with how many the user has, and is full from this count on.
const LIKED_TITLES_FOR_FULL_SIMILAR_SHARE = 10;

export const sourceSharesFor = (
  exploreLevel: number,
  likedCount: number,
): SourceShares => {
  const taste = blendByExploreLevel(SOURCE_SHARE_RANGES.taste, exploreLevel);
  const popular = blendByExploreLevel(
    SOURCE_SHARE_RANGES.popular,
    exploreLevel,
  );
  const fullSimilar = blendByExploreLevel(
    SOURCE_SHARE_RANGES.similar,
    exploreLevel,
  );

  const similar =
    fullSimilar * Math.min(likedCount / LIKED_TITLES_FOR_FULL_SIMILAR_SHARE, 1);

  // The share too few liked titles can't claim goes back to taste discovery.
  return { taste: taste + (fullSimilar - similar), similar, popular };
};
