import { describe, expect, it } from '@jest/globals';
import { MOVIES, SERIES, Title } from '@/taste/constants/pools.constant';

const MIN_TITLES_PER_GENRE = 4;

describe.each([
  ['movies', MOVIES],
  ['series', SERIES],
])('the %s pool', (_name, pool) => {
  it('holds enough titles in every genre it covers', () => {
    const counts = new Map<number, number>();
    for (const title of pool) {
      counts.set(title.mainGenreId, (counts.get(title.mainGenreId) ?? 0) + 1);
    }

    const thin = [...counts.entries()].filter(
      ([, count]) => count < MIN_TITLES_PER_GENRE,
    );

    expect(thin).toEqual([]);
  });

  it('has no repeated titles', () => {
    expect(new Set(pool.map((title) => title.tmdbId)).size).toBe(pool.length);
  });

  it('has a poster for every title', () => {
    const missing = pool.filter(
      (title: Title) =>
        !/^https:\/\/image\.tmdb\.org\/.+\.jpg$/.test(title.poster),
    );

    expect(missing.map((title) => title.title)).toEqual([]);
  });
});
