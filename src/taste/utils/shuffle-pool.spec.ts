import { describe, expect, it } from '@jest/globals';
import { MOVIES, SERIES, Title } from '@/taste/constants/pools.constant';
import { shuffledPool } from '@/taste/utils/shuffle-pool';

const ids = (pool: Title[]) => pool.map((title) => title.tmdbId);

describe.each([
  ['movies', MOVIES],
  ['series', SERIES],
])('shuffling the %s pool', (_name, pool) => {
  it('keeps every title and adds none', () => {
    expect(ids(shuffledPool(pool)).sort()).toEqual(ids(pool).sort());
  });

  it('leaves the pool itself untouched', () => {
    const before = ids(pool);
    shuffledPool(pool);

    expect(ids(pool)).toEqual(before);
  });

  it('covers every genre before it shows a second of any', () => {
    const genreCount = new Set(pool.map((title) => title.mainGenreId)).size;
    const genres = shuffledPool(pool).map((title) => title.mainGenreId);

    expect(new Set(genres.slice(0, genreCount)).size).toBe(genreCount);
  });

  it('gives a different order across runs', () => {
    const orders = new Set(
      Array.from({ length: 20 }, () => ids(shuffledPool(pool)).join(',')),
    );

    expect(orders.size).toBeGreaterThan(1);
  });
});
