import { Duration } from '@/common/app.constants';
import { FlexibilityOptionId } from '@/taste/constants/flexibility-options.constant';

export const FEED_PAGE_SIZE = 20;
export const DISCOVER_PAGES_PER_BUILD = 3;
export const MAX_LIBRARY_SOURCES = 5;
export const MAX_POOL_SIZE = 500;
export const VOTE_COUNT_FLOOR = 50;
export const POPULAR_VOTE_COUNT_FLOOR = 100;

export const POOL_TTL = Duration.ONE_HOUR * 6;
export const STATE_TTL = Duration.ONE_HOUR * 6;
export const SERVED_TTL = Duration.ONE_DAY * 7;

export type RankingWeights = {
  genreMatch: number;
  quality: number;
  similar: number;
  shuffle: number;
};

export type ScorerKey = keyof RankingWeights;

// Flexibility tunes how tightly the feed hugs taste: strict → high genreMatch,
// almost no shuffle (safe, on-taste); flexible → lower genreMatch, more shuffle
// (wider, more variety). quality and similar stay constant across the board.
export const RANKING_WEIGHTS_BY_FLEXIBILITY: Record<
  FlexibilityOptionId,
  RankingWeights
> = {
  strict: { genreMatch: 1.2, quality: 0.6, similar: 0.8, shuffle: 0.1 },
  normal: { genreMatch: 1.0, quality: 0.6, similar: 0.8, shuffle: 0.3 },
  flexible: { genreMatch: 0.6, quality: 0.6, similar: 0.8, shuffle: 0.6 },
};
