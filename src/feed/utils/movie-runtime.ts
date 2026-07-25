import {
  LONG_MIN_RUNTIME,
  MIN_MOVIE_RUNTIME,
  SHORT_MAX_RUNTIME,
} from '@/feed/constants/feed.constant';
import {
  COMMITMENT,
  CommitmentAnswer,
} from '@/taste/constants/journey.constant';

/**
 * The movie runtime window from the commitment answer and the "long watches"
 * avoid cap. Pass no commitment for sources the lean shouldn't touch.
 */
export const movieRuntimeParams = (
  cap: number | null,
  commitment: CommitmentAnswer | null,
): Record<string, number> => {
  let min = MIN_MOVIE_RUNTIME;
  let max: number | null = null;

  if (commitment === COMMITMENT.SHORT) max = SHORT_MAX_RUNTIME;
  if (commitment === COMMITMENT.LONG) min = LONG_MIN_RUNTIME;

  if (cap !== null) {
    max = Math.min(max ?? cap, cap);
    // A cap that meets the 'long' floor closes the window, so the floor goes
    // back to the minimum rather than leaving nothing to find.
    if (min >= max) min = MIN_MOVIE_RUNTIME;
  }

  return {
    'with_runtime.gte': min,
    ...(max !== null && { 'with_runtime.lte': max }),
  };
};
