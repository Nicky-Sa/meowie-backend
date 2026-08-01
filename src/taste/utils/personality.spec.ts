import { describe, expect, it } from '@jest/globals';
import { personalityFor, PersonalityInput } from '@/taste/utils/personality';
import { MOVIES, SERIES, Title } from '@/taste/constants/pools.constant';
import {
  BOTH,
  ERA,
  AUTHORITY,
  TitleRatings,
} from '@/taste/constants/journey.constant';
import {
  Personality,
  EVERYTHING_CAT,
  PERSONALITY_GROUPS,
} from '@/taste/constants/personality.constant';

const idFromPool = (pool: Title[], title: string): number => {
  const found = pool.find((entry) => entry.title === title);
  if (!found) throw new Error(`Title not in pool: ${title}`);
  return found.tmdbId;
};

const movieId = (title: string): number => idFromPool(MOVIES, title);
const seriesId = (title: string): number => idFromPool(SERIES, title);

const likedMovies = (...titles: string[]): TitleRatings =>
  Object.fromEntries(titles.map((title) => [movieId(title), 'like']));

const inputWith = (overrides: Partial<PersonalityInput>): PersonalityInput => ({
  movieRatings: {},
  seriesRatings: {},
  era: ERA.NEW_RELEASE,
  authority: AUTHORITY.POPULAR,
  ...overrides,
});

const personality = (overrides: Partial<PersonalityInput>) =>
  personalityFor(inputWith(overrides));

describe('the top genre leads', () => {
  it('gives the same cat whatever the answers are, when the genre has one', () => {
    // Crime has a single cat, so no set of answers can steer away from it.
    const movieRatings = likedMovies('The Godfather', 'Pulp Fiction');

    expect(
      personality({
        era: ERA.NEW_RELEASE,
        authority: AUTHORITY.CRITICS_CHOICE,
        movieRatings,
      }).name,
    ).toBe('Tony Meowtana');
  });

  it('lets the answers choose between a genre with several cats', () => {
    const movieRatings = likedMovies('The Lord of the Rings'); // Fantasy

    const cat = (overrides: Partial<PersonalityInput>) =>
      personality({ movieRatings, ...overrides }).name;

    expect(cat({ era: ERA.CLASSIC, authority: AUTHORITY.CRITICS_CHOICE })).toBe(
      'Edward Scissorpaws',
    );
    expect(cat({ era: ERA.NEW_RELEASE, authority: AUTHORITY.POPULAR })).toBe(
      'Hairy Pawter',
    );
    expect(
      cat({ era: ERA.NEW_RELEASE, authority: AUTHORITY.CRITICS_CHOICE }),
    ).toBe('Furrodo Bagpaws');
  });

  it('counts one vote per liked title, so two beat one rarer', () => {
    // Two crime likes outrank one music like, though Music is the rarer genre.
    const result = personality({
      movieRatings: likedMovies(
        'The Godfather',
        'Pulp Fiction',
        'Bohemian Rhapsody',
      ),
    });

    expect(result.name).toBe('Tony Meowtana');
  });
});

describe('only likes vote', () => {
  it('ignores a disliked title', () => {
    const result = personality({
      movieRatings: {
        ...likedMovies('The Godfather'),
        [movieId('Bohemian Rhapsody')]: 'dislike',
        [movieId('Whiplash')]: 'dislike',
      },
    });

    // Music would win on count if dislikes voted; Crime wins because they don't.
    expect(result.name).toBe('Tony Meowtana');
  });

  it("ignores a title marked haven't seen", () => {
    const notSeen = personality({
      movieRatings: {
        ...likedMovies('The Godfather'),
        [movieId('Bohemian Rhapsody')]: 'not-seen',
      },
    });

    expect(notSeen).toEqual(
      personality({ movieRatings: likedMovies('The Godfather') }),
    );
  });
});

describe("a 'no preference' answer steps aside", () => {
  it('leaves the choice to the answer given', () => {
    const movieRatings = likedMovies('The Lord of the Rings'); // Fantasy

    expect(
      personality({
        era: ERA.CLASSIC,
        authority: BOTH,
        movieRatings,
      }).name,
    ).toBe('Edward Scissorpaws');
  });

  it('breaks a tie between two cats on the modern side', () => {
    // Fantasy has a critics' cat on both sides of era, and era went unanswered.
    const movieRatings = likedMovies('The Lord of the Rings');

    expect(
      personality({
        era: BOTH,
        authority: AUTHORITY.CRITICS_CHOICE,
        movieRatings,
      }).name,
    ).toBe('Furrodo Bagpaws');
  });

  it('falls back to the popular-modern side when nothing else decides', () => {
    expect(personality({ era: BOTH })).toEqual(
      personality({ era: ERA.NEW_RELEASE }),
    );
    expect(personality({ authority: BOTH })).toEqual(
      personality({ authority: AUTHORITY.POPULAR }),
    );
  });
});

describe('the everything cat', () => {
  it("wins when both answers are 'both'", () => {
    const result = personality({ era: BOTH, authority: BOTH });

    expect(result).toEqual(EVERYTHING_CAT);
  });

  it("stays away while one answer is not 'both'", () => {
    expect(
      personality({ era: BOTH, authority: AUTHORITY.POPULAR }),
    ).not.toEqual(EVERYTHING_CAT);
    expect(personality({ era: ERA.CLASSIC, authority: BOTH })).not.toEqual(
      EVERYTHING_CAT,
    );
  });

  it("still wins on two 'both' answers with likes in hand", () => {
    const result = personality({
      era: BOTH,
      authority: BOTH,
      movieRatings: likedMovies('The Godfather'),
    });

    expect(result).toEqual(EVERYTHING_CAT);
  });
});

describe('picking the cat', () => {
  it("uses the group's own cat when nothing was liked", () => {
    const result = personality({
      era: ERA.CLASSIC,
      authority: AUTHORITY.POPULAR,
    });

    expect(result.name).toBe('Luke Skywhisker');
  });

  it("falls back to a group's own cat for a genre no cat covers", () => {
    // Comedy is the top genre here, and no group has a comedy cat.
    const result = personality({
      era: ERA.CLASSIC,
      authority: AUTHORITY.POPULAR,
      movieRatings: likedMovies('The Grand Budapest Hotel'),
    });

    expect(result.name).toBe('Luke Skywhisker');
  });

  it('works on series likes too', () => {
    // Dark locks Mystery, which only the new-release critics group has a cat for.
    const result = personality({
      era: ERA.NEW_RELEASE,
      authority: AUTHORITY.CRITICS_CHOICE,
      seriesRatings: { [seriesId('Dark')]: 'like' },
    });

    expect(result.name).toBe('Rust Clawle');
  });
});

describe('every cat card', () => {
  const everyCat: Personality[] = [
    EVERYTHING_CAT,
    ...Object.values(PERSONALITY_GROUPS).flatMap((group) => [
      group.default,
      ...Object.values(group.byGenre).filter(
        (cat): cat is Personality => cat !== undefined,
      ),
    ]),
  ];

  it('has a name and a picture', () => {
    for (const cat of everyCat) {
      expect(cat.name).not.toBe('');
      expect(cat.image).toMatch(/^https:\/\/.+\.png$/);
    }
  });

  it('is used by only one entry', () => {
    const images = everyCat.map((cat) => cat.image);

    expect(new Set(images).size).toBe(images.length);
  });
});
