import { describe, expect, it } from '@jest/globals';
import { personalityFor, PersonalityInput } from '@/taste/personality';
import { MOVIES, SERIES, Title } from '@/taste/constants/pools.constant';
import {
  BOTH,
  ERA,
  RARITY_WEIGHTS,
  REALITY,
  TASTE_AUTHORITY,
} from '@/taste/constants/journey.constant';
import {
  Character,
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
  tasteAuthority: TASTE_AUTHORITY.POPULAR,
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

describe('the everything cat', () => {
  it("wins when all three answers are 'both'", () => {
    const result = personality({
      era: BOTH,
      reality: BOTH,
      tasteAuthority: BOTH,
    });

    expect(result).toEqual(EVERYTHING_CAT);
  });

  it("stays away while two 'both' answers can be read from the picks", () => {
    const movieIds = [movieId('The Godfather'), movieId('Pulp Fiction')];

    expect(personality({ era: BOTH, reality: BOTH, movieIds })).toEqual(
      personality({ era: ERA.CLASSIC, reality: REALITY.REALISTIC, movieIds }),
    );
  });

  it("still wins on three 'both' answers with picks in hand", () => {
    const result = personality({
      era: BOTH,
      reality: BOTH,
      tasteAuthority: BOTH,
      movieIds: [movieId('The Godfather')],
      genreIds: [80],
    });

    expect(result).toEqual(EVERYTHING_CAT);
  });
});

describe('picking the cat', () => {
  it('uses the top genre of the picks when the group has one for it', () => {
    // Three crime titles, so Crime beats Drama on count.
    const result = personality({
      era: ERA.CLASSIC,
      reality: REALITY.REALISTIC,
      tasteAuthority: TASTE_AUTHORITY.POPULAR,
      movieIds: [
        movieId('The Godfather'),
        movieId('Pulp Fiction'),
        movieId('Blue Ruin'),
      ],
    });

    expect(result.name).toBe('Tony Meowtana');
  });

  it('counts the tapped genre chips alongside the picks', () => {
    // Whiplash brings Music and Drama; the Crime chip outweighs both.
    const result = personality({
      era: ERA.CLASSIC,
      reality: REALITY.REALISTIC,
      tasteAuthority: TASTE_AUTHORITY.POPULAR,
      movieIds: [movieId('Whiplash')],
      genreIds: [80],
    });

    expect(result.name).toBe('Tony Meowtana');
  });

  it('picks the cat from the chips alone when nothing was picked', () => {
    const result = personality({
      era: ERA.CLASSIC,
      reality: REALITY.REALISTIC,
      tasteAuthority: TASTE_AUTHORITY.POPULAR,
      genreIds: [18],
    });

    expect(result.name).toBe('Furrest Gump');
  });

  it("leaves the 'both' answers to the picks, not the chips", () => {
    // Fantasy and Science Fiction chips must not flip the reality lean.
    const movieIds = [movieId('The Godfather'), movieId('Titanic')];

    expect(
      personality({ reality: BOTH, movieIds, genreIds: [14, 878] }),
    ).toEqual(
      personality({
        reality: REALITY.REALISTIC,
        movieIds,
        genreIds: [14, 878],
      }),
    );
  });

  it("falls back to the group's own cat for an unlisted top genre", () => {
    // Music is the top genre here, and that group has no music cat.
    const result = personality({
      era: ERA.CLASSIC,
      reality: REALITY.REALISTIC,
      tasteAuthority: TASTE_AUTHORITY.POPULAR,
      movieIds: [movieId('Whiplash')],
    });

    expect(result.name).toBe('Rocky Pawboa');
  });
});

describe('every cat card', () => {
  const everyCat: Character[] = [
    EVERYTHING_CAT,
    ...Object.values(PERSONALITY_GROUPS).flatMap((group) => [
      group.default,
      ...Object.values(group.byGenre).filter(
        (cat): cat is Character => cat !== undefined,
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
