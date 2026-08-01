import { MIN_MOVIE_RUNTIME } from '@/feed/constants/feed.constant';

/** The movie runtime window from the "long watches" avoid cap. */
export const movieRuntimeParams = (
  cap: number | null,
): Record<string, number> => ({
  'with_runtime.gte': MIN_MOVIE_RUNTIME,
  ...(cap !== null && { 'with_runtime.lte': cap }),
});
