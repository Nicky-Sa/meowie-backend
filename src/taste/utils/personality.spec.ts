import { describe, expect, it } from '@jest/globals';
import { personalityFor, PersonalityInput } from '@/taste/utils/personality';
import { MOVIES, SERIES, Title } from '@/taste/constants/pools.constant';
import {
  BOTH,
  ERA,
  AUTHORITY,
  TitleAnswer,
  TitleRatings,
} from '@/taste/constants/journey.constant';
import { CATS, EVERYTHING_CAT } from '@/taste/constants/personality.constant';

const idsInGenre = (
  pool: Title[],
  genreId: number,
  howMany: number,
): number[] =>
  pool
    .filter((title) => title.mainGenreId === genreId)
    .slice(0, howMany)
    .map((title) => title.tmdbId);

const ratings = (ids: number[], answer: TitleAnswer): TitleRatings =>
  Object.fromEntries(ids.map((id) => [id, answer]));

const inputWith = (overrides: Partial<PersonalityInput>): PersonalityInput => ({
  movieRatings: {},
  seriesRatings: {},
  era: BOTH,
  authority: BOTH,
  ...overrides,
});

const catNamed = (name: string) => {
  const found = CATS.find((cat) => cat.name === name);
  if (!found) throw new Error(`No cat named ${name}`);
  return found;
};

describe('personalityFor', () => {
  it('gives the everything cat when nothing was liked and no side taken', () => {
    expect(personalityFor(inputWith({}))).toEqual(EVERYTHING_CAT);
  });

  it('ignores ids that are not in the deck', () => {
    // One like and one dislike, so the way they rated says nothing either.
    const picked = personalityFor(
      inputWith({
        movieRatings: {
          ...ratings([99999], 'like'),
          ...ratings([99998], 'dislike'),
        },
      }),
    );

    expect(picked).toEqual(EVERYTHING_CAT);
  });

  it('picks a cat of the genre the user liked most', () => {
    const picked = personalityFor(
      inputWith({ movieRatings: ratings(idsInGenre(MOVIES, 27, 4), 'like') }),
    );

    expect(catNamed(picked.name).genres).toContain(27);
  });

  it('reads liked series the same way as liked movies', () => {
    const picked = personalityFor(
      inputWith({ seriesRatings: ratings(idsInGenre(SERIES, 16, 4), 'like') }),
    );

    expect(catNamed(picked.name).genres).toContain(16);
  });

  it('lets the answers choose between two cats of the same genre', () => {
    const crime = idsInGenre(MOVIES, 80, 4);

    const classicCritics = personalityFor(
      inputWith({
        movieRatings: ratings(crime, 'like'),
        era: ERA.CLASSIC,
        authority: AUTHORITY.CRITICS_CHOICE,
      }),
    );
    const newPopular = personalityFor(
      inputWith({
        movieRatings: ratings(crime, 'like'),
        era: ERA.NEW_RELEASE,
        authority: AUTHORITY.POPULAR,
      }),
    );

    expect(catNamed(classicCritics.name).era).toBe(ERA.CLASSIC);
    expect(catNamed(newPopular.name).era).toBe(ERA.NEW_RELEASE);
    expect(catNamed(classicCritics.name).genres).toContain(80);
    expect(catNamed(newPopular.name).genres).toContain(80);
  });

  it('reads the answers alone when the user liked nothing', () => {
    const picked = personalityFor(
      inputWith({ era: ERA.CLASSIC, authority: AUTHORITY.CRITICS_CHOICE }),
    );

    expect(catNamed(picked.name).era).toBe(ERA.CLASSIC);
    expect(catNamed(picked.name).authority).toBe(AUTHORITY.CRITICS_CHOICE);
  });

  it('separates a hard-to-please rater from an easy-going one', () => {
    const crime = idsInGenre(MOVIES, 80, 8);

    const hardToPlease = personalityFor(
      inputWith({
        movieRatings: {
          ...ratings(crime.slice(0, 2), 'like'),
          ...ratings(crime.slice(2), 'dislike'),
        },
        era: ERA.CLASSIC,
        authority: AUTHORITY.CRITICS_CHOICE,
      }),
    );
    const easyGoing = personalityFor(
      inputWith({
        movieRatings: ratings(crime, 'like'),
        era: ERA.CLASSIC,
        authority: AUTHORITY.CRITICS_CHOICE,
      }),
    );

    expect(catNamed(hardToPlease.name).trait).toBe('hard-to-please');
    expect(hardToPlease.name).not.toBe(easyGoing.name);
  });

  it('reads a deck of skips as lots left to watch', () => {
    const adventure = idsInGenre(MOVIES, 12, 6);

    const picked = personalityFor(
      inputWith({
        movieRatings: {
          ...ratings(adventure.slice(0, 2), 'like'),
          ...ratings(adventure.slice(2), 'not-seen'),
        },
        era: ERA.CLASSIC,
        authority: AUTHORITY.POPULAR,
      }),
    );

    expect(catNamed(picked.name).trait).toBe('lots-left-to-watch');
  });
});

describe('every cat card', () => {
  it('has a name and a picture', () => {
    for (const cat of [EVERYTHING_CAT, ...CATS]) {
      expect(cat.name).not.toBe('');
      expect(cat.image).toMatch(/^https:\/\/.+\.png$/);
    }
  });

  it('uses its picture and its name only once', () => {
    const cards = [EVERYTHING_CAT, ...CATS];

    expect(new Set(cards.map((cat) => cat.image)).size).toBe(cards.length);
    expect(new Set(cards.map((cat) => cat.name)).size).toBe(cards.length);
  });

  it('stands for at least one genre', () => {
    for (const cat of CATS) {
      expect(cat.genres.length).toBeGreaterThan(0);
    }
  });
});
