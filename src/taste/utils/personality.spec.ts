import { describe, expect, it } from '@jest/globals';
import { personalityFor, PersonalityInput } from '@/taste/utils/personality';
import { MOVIES, SERIES, Title } from '@/taste/constants/pools.constant';
import {
  BOTH,
  ERA,
  REALITY,
  AUTHORITY,
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

const inputWith = (overrides: Partial<PersonalityInput>): PersonalityInput => ({
  movieIds: [],
  seriesIds: [],
  genreIds: [],
  era: ERA.NEW_RELEASE,
  reality: REALITY.REALISTIC,
  authority: AUTHORITY.POPULAR,
  ...overrides,
});

const personality = (overrides: Partial<PersonalityInput>) =>
  personalityFor(inputWith(overrides));

describe('the top genre leads', () => {
  it('gives the same cat whatever the answers are, when the genre has one', () => {
    // Crime has a single cat, so no set of answers can steer away from it.
    const movieIds = [movieId('The Godfather'), movieId('Pulp Fiction')];

    expect(
      personality({
        era: ERA.NEW_RELEASE,
        reality: REALITY.FANTASY,
        authority: AUTHORITY.CRITICS_CHOICE,
        movieIds,
      }).name,
    ).toBe('Tony Meowtana');
  });

  it('lets the answers choose between a genre with several cats', () => {
    const movieIds = [movieId('The Lord of the Rings')]; // Fantasy

    const cat = (overrides: Partial<PersonalityInput>) =>
      personality({ reality: REALITY.FANTASY, movieIds, ...overrides }).name;

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

  it('counts a genre once per pick that locked it, plus once as a chip', () => {
    // Two crime picks outrank one music chip, though Music is the rarer genre.
    const result = personality({
      movieIds: [movieId('The Godfather'), movieId('Pulp Fiction')],
      genreIds: [80, 10402],
    });

    expect(result.name).toBe('Tony Meowtana');
  });
});

describe("a 'no preference' answer steps aside", () => {
  it('leaves the choice to the two answers given', () => {
    const movieIds = [movieId('The Lord of the Rings')]; // Fantasy

    expect(
      personality({
        era: ERA.CLASSIC,
        reality: REALITY.FANTASY,
        authority: BOTH,
        movieIds,
      }).name,
    ).toBe('Edward Scissorpaws');
  });

  it('breaks a tie between two cats on the popular-modern side', () => {
    // Fantasy has a critics' cat on both sides of era, and era went unanswered.
    const movieIds = [movieId('The Lord of the Rings')];

    expect(
      personality({
        era: BOTH,
        reality: REALITY.FANTASY,
        authority: AUTHORITY.CRITICS_CHOICE,
        movieIds,
      }).name,
    ).toBe('Furrodo Bagpaws');
  });

  it('falls back to the popular-modern side when nothing else decides', () => {
    expect(personality({ era: BOTH })).toEqual(
      personality({ era: ERA.NEW_RELEASE }),
    );
    expect(personality({ reality: BOTH })).toEqual(
      personality({ reality: REALITY.REALISTIC }),
    );
    expect(personality({ authority: BOTH })).toEqual(
      personality({ authority: AUTHORITY.POPULAR }),
    );
  });
});

describe('the everything cat', () => {
  it("wins when all three answers are 'both'", () => {
    const result = personality({
      era: BOTH,
      reality: BOTH,
      authority: BOTH,
    });

    expect(result).toEqual(EVERYTHING_CAT);
  });

  it("stays away while one answer is not 'both'", () => {
    const movieIds = [movieId('The Godfather'), movieId('Pulp Fiction')];

    expect(personality({ era: BOTH, reality: BOTH, movieIds })).toEqual(
      personality({
        era: ERA.NEW_RELEASE,
        reality: REALITY.REALISTIC,
        movieIds,
      }),
    );
  });

  it("still wins on three 'both' answers with picks in hand", () => {
    const result = personality({
      era: BOTH,
      reality: BOTH,
      authority: BOTH,
      movieIds: [movieId('The Godfather')],
      genreIds: [80],
    });

    expect(result).toEqual(EVERYTHING_CAT);
  });
});

describe('picking the cat', () => {
  it('picks the cat from the chips alone when nothing was picked', () => {
    const result = personality({
      era: ERA.CLASSIC,
      reality: REALITY.REALISTIC,
      authority: AUTHORITY.POPULAR,
      genreIds: [18],
    });

    expect(result.name).toBe('Furrest Gump');
  });

  it("falls back to a group's own cat for a genre no cat covers", () => {
    // Comedy is the top genre here, and no group has a comedy cat.
    const result = personality({
      era: ERA.CLASSIC,
      reality: REALITY.REALISTIC,
      authority: AUTHORITY.POPULAR,
      movieIds: [movieId('The Grand Budapest Hotel')],
    });

    expect(result.name).toBe('Rocky Pawboa');
  });

  it('works on series picks too', () => {
    // Dark locks Mystery, which only the new-release critics group has a cat for.
    const result = personality({
      era: ERA.NEW_RELEASE,
      reality: REALITY.REALISTIC,
      authority: AUTHORITY.CRITICS_CHOICE,
      seriesIds: [seriesId('Dark')],
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
