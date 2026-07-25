import { describe, expect, it } from '@jest/globals';
import { MOVIES, SERIES, Title } from '@/taste/constants/pools.constant';
import { GENRE_IDS } from '@/taste/constants/journey.constant';
import { MOVIE_TO_TV_GENRE_IDS } from '@/feed/constants/movie-to-tv-genres.constant';

const TITLES_PER_GENRE = 2;

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

  it('only locks a genre the title actually carries', () => {
    const wrong = pool.filter(
      (title) => !title.genreIds.includes(title.mainGenreId),
    );

    expect(wrong.map((title) => title.title)).toEqual([]);
  });

  it('offers every genre as a chip', () => {
    const missing = [...new Set(mainGenres(pool))].filter(
      (genre) => !GENRE_IDS.includes(genre),
    );

    expect(missing).toEqual([]);
  });

  it('has no repeated titles', () => {
    expect(new Set(pool.map((title) => title.tmdbId)).size).toBe(pool.length);
  });
});

// A series pick would otherwise lock a genre that can't narrow TV discovery.
it('only locks series genres that have a TV counterpart', () => {
  const withoutTvGenre = SERIES.filter(
    (series) => !MOVIE_TO_TV_GENRE_IDS[series.mainGenreId],
  );

  expect(withoutTvGenre.map((series) => series.title)).toEqual([]);
});
