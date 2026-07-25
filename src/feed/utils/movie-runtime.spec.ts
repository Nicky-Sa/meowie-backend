import { describe, expect, it } from '@jest/globals';
import { movieRuntimeParams } from '@/feed/utils/movie-runtime';
import {
  LONG_MIN_RUNTIME,
  MIN_MOVIE_RUNTIME,
  SHORT_MAX_RUNTIME,
} from '@/feed/constants/feed.constant';
import { COMMITMENT } from '@/taste/constants/journey.constant';

const LONG_WATCHES_CAP = 150;

describe('movieRuntimeParams', () => {
  it('only sets a floor when nothing limits the length', () => {
    expect(movieRuntimeParams(null, null)).toEqual({
      'with_runtime.gte': MIN_MOVIE_RUNTIME,
    });
  });

  it('caps the length for a short commitment', () => {
    expect(movieRuntimeParams(null, COMMITMENT.SHORT)).toEqual({
      'with_runtime.gte': MIN_MOVIE_RUNTIME,
      'with_runtime.lte': SHORT_MAX_RUNTIME,
    });
  });

  it('raises the floor for a long commitment', () => {
    expect(movieRuntimeParams(null, COMMITMENT.LONG)).toEqual({
      'with_runtime.gte': LONG_MIN_RUNTIME,
    });
  });

  it('lets the avoid cap beat a long commitment instead of meeting it', () => {
    const params = movieRuntimeParams(LONG_WATCHES_CAP, COMMITMENT.LONG);

    expect(params['with_runtime.lte']).toBe(LONG_WATCHES_CAP);
    expect(params['with_runtime.gte']).toBe(MIN_MOVIE_RUNTIME);
  });

  it('keeps the tighter of the cap and a short commitment', () => {
    expect(movieRuntimeParams(LONG_WATCHES_CAP, COMMITMENT.SHORT)).toEqual({
      'with_runtime.gte': MIN_MOVIE_RUNTIME,
      'with_runtime.lte': SHORT_MAX_RUNTIME,
    });
  });
});
