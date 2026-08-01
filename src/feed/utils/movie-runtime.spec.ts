import { describe, expect, it } from '@jest/globals';
import { movieRuntimeParams } from '@/feed/utils/movie-runtime';
import { MIN_MOVIE_RUNTIME } from '@/feed/constants/feed.constant';

const LONG_WATCHES_CAP = 150;

describe('movieRuntimeParams', () => {
  it('only sets a floor when nothing limits the length', () => {
    expect(movieRuntimeParams(null)).toEqual({
      'with_runtime.gte': MIN_MOVIE_RUNTIME,
    });
  });

  it('caps the length from the avoid cap', () => {
    expect(movieRuntimeParams(LONG_WATCHES_CAP)).toEqual({
      'with_runtime.gte': MIN_MOVIE_RUNTIME,
      'with_runtime.lte': LONG_WATCHES_CAP,
    });
  });
});
