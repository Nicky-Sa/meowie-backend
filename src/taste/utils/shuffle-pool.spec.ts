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

  it('still covers every genre once before repeating one', () => {
    const roundSize = pool.length / 2;
    const genres = shuffledPool(pool).map((title) => title.mainGenreId);
    const firstRound = new Set(genres.slice(0, roundSize));

    expect(firstRound.size).toBe(roundSize);
    expect(new Set(genres.slice(roundSize))).toEqual(firstRound);
  });

  it('gives a different order across runs', () => {
    const orders = new Set(
      Array.from({ length: 20 }, () => ids(shuffledPool(pool)).join(',')),
    );

    expect(orders.size).toBeGreaterThan(1);
  });
});
