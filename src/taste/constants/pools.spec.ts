import { describe, expect, it } from '@jest/globals';
import { MOVIES, SERIES, Title } from '@/taste/constants/pools.constant';

const TITLES_PER_GENRE = 2;

// Genres never reach the app. They order the deck so the first posters cover
// as many kinds of title as possible, and they name the cat card.
const mainGenres = (pool: Title[]) => pool.map((title) => title.mainGenreId);

describe.each([
  ['movies', MOVIES],
  ['series', SERIES],
])('the %s pool', (_name, pool) => {
  it('holds two titles for every genre it covers', () => {
    const counts = new Map<number, number>();
    for (const genre of mainGenres(pool)) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }

    expect([...counts.values()]).toEqual(
      counts.size > 0 ? Array(counts.size).fill(TITLES_PER_GENRE) : [],
    );
  });

  it('runs one title per genre before it repeats one', () => {
    const genres = mainGenres(pool);
    const perRound = genres.length / TITLES_PER_GENRE;
    const firstRound = genres.slice(0, perRound);

    expect(new Set(firstRound).size).toBe(perRound);
    expect(genres.slice(perRound)).toEqual(firstRound);
  });

  it('has no repeated titles', () => {
    expect(new Set(pool.map((title) => title.tmdbId)).size).toBe(pool.length);
  });
});
