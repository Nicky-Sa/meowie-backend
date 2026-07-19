import { describe, expect, it } from '@jest/globals';
import { personalityFor, PersonalityInput } from '@/taste/personality';
import { MOVIES, SERIES, Title } from '@/taste/constants/pools.constant';
import {
  BOTH,
  COMMITMENT,
  ERA,
  RARITY_WEIGHTS,
  REALITY,
  TASTE_AUTHORITY,
} from '@/taste/constants/journey.constant';

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
  era: ERA.NEW_RELEASE,
  reality: REALITY.REALISTIC,
  tasteAuthority: TASTE_AUTHORITY.POPULAR,
  commitment: COMMITMENT.BOTH,
  ...overrides,
});

const personality = (overrides: Partial<PersonalityInput>) =>
  personalityFor(inputWith(overrides), RARITY_WEIGHTS);

describe("breaking a single 'both' answer with the poster picks", () => {
  it('reads mostly-classic picks as a classic era lean', () => {
    const movieIds = [
      movieId('The Godfather'),
      movieId('Pulp Fiction'),
      movieId('Titanic'),
    ];

    expect(personality({ era: BOTH, movieIds })).toEqual(
      personality({ era: ERA.CLASSIC, movieIds }),
    );
  });

  it('reads recent picks as a new-release era lean', () => {
    const movieIds = [
      movieId('Dune'),
      movieId('Everything Everywhere All at Once'),
    ];

    expect(personality({ era: BOTH, movieIds })).toEqual(
      personality({ era: ERA.NEW_RELEASE, movieIds }),
    );
  });

  it('reads fantasy-heavy picks as a fantasy lean', () => {
    const movieIds = [
      movieId('Spirited Away'),
      movieId('The Lord of the Rings'),
    ];

    expect(personality({ reality: BOTH, movieIds })).toEqual(
      personality({ reality: REALITY.FANTASY, movieIds }),
    );
  });

  it('reads grounded picks as a realistic lean', () => {
    const movieIds = [movieId('The Godfather'), movieId('Titanic')];

    expect(personality({ reality: BOTH, movieIds })).toEqual(
      personality({ reality: REALITY.REALISTIC, movieIds }),
    );
  });

  it("reads mostly hidden gems as a critics' choice lean", () => {
    const movieIds = [
      movieId('Coherence'),
      movieId('Blue Ruin'),
      movieId('Moon'),
    ];

    expect(personality({ tasteAuthority: BOTH, movieIds })).toEqual(
      personality({ tasteAuthority: TASTE_AUTHORITY.CRITICS_CHOICE, movieIds }),
    );
  });

  it('reads mainstream picks as a popular lean', () => {
    const movieIds = [movieId('The Dark Knight'), movieId('Titanic')];

    expect(personality({ tasteAuthority: BOTH, movieIds })).toEqual(
      personality({ tasteAuthority: TASTE_AUTHORITY.POPULAR, movieIds }),
    );
  });

  it('works on series picks too', () => {
    const seriesIds = [
      seriesId('Dark'),
      seriesId('Fleabag'),
      seriesId('Chernobyl'),
    ];

    expect(personality({ tasteAuthority: BOTH, seriesIds })).toEqual(
      personality({
        tasteAuthority: TASTE_AUTHORITY.CRITICS_CHOICE,
        seriesIds,
      }),
    );
  });

  it('falls back to the popular-modern side without any picks', () => {
    expect(personality({ era: BOTH })).toEqual(
      personality({ era: ERA.NEW_RELEASE }),
    );
  });
});

describe('tie boundaries keep the old fixed defaults', () => {
  it('equal classic and modern picks resolve to new-release', () => {
    const movieIds = [movieId('The Godfather'), movieId('Dune')];

    expect(personality({ era: BOTH, movieIds })).toEqual(
      personality({ era: ERA.NEW_RELEASE, movieIds }),
    );
  });

  it('equal grounded and escapist genre hits resolve to realistic', () => {
    // Interstellar carries one escapist genre (878) and one grounded (18).
    const movieIds = [movieId('Interstellar')];

    expect(personality({ reality: BOTH, movieIds })).toEqual(
      personality({ reality: REALITY.REALISTIC, movieIds }),
    );
  });

  it('exactly half hidden gems resolve to popular', () => {
    const movieIds = [movieId('The Dark Knight'), movieId('Coherence')];

    expect(personality({ tasteAuthority: BOTH, movieIds })).toEqual(
      personality({ tasteAuthority: TASTE_AUTHORITY.POPULAR, movieIds }),
    );
  });
});

describe('the omnivore', () => {
  it("wins with two or more 'both' answers regardless of picks", () => {
    const result = personality({
      era: BOTH,
      reality: BOTH,
      movieIds: [movieId('The Godfather')],
    });

    expect(result.isOmnivore).toBe(true);
  });
});
