import { GenreId } from '@/taste/constants/pools.constant';
import {
  AuthorityAnswer,
  BOTH,
  ERA,
  EraAnswer,
  REALITY,
  RealityAnswer,
  TASTE_AUTHORITY,
} from '@/taste/constants/journey.constant';

/**
 * Personality archetypes for the shareable "You watch like ..." reveal.
 *
 * PRESENTATION ONLY. This never feeds the recommendation taste vector.
 *
 * The `poster` URLs are the movie poster of each character's source title
 * (TMDB, w780), shown as the reveal card backdrop.
 */

export type Character = { name: string; source: string; poster: string };

export type PersonalityCell = {
  rarityPercent: number;
  description: string;
  default: Character;
  byGenre: Partial<Record<GenreId, Character>>;
};

export type EraValue = Exclude<EraAnswer, typeof BOTH>;
export type RealityValue = Exclude<RealityAnswer, typeof BOTH>;
export type AuthorityValue = Exclude<AuthorityAnswer, typeof BOTH>;

export type CellKey = `${EraValue}_${RealityValue}_${AuthorityValue}`;

const poster = (path: string) => `https://image.tmdb.org/t/p/w780${path}`;

// Builds the cell keys below from the answer constants, so changing an answer
// value never touches this file.
const cellKey = <
  TEra extends EraValue,
  TReality extends RealityValue,
  TAuthority extends AuthorityValue,
>(
  era: TEra,
  reality: TReality,
  authority: TAuthority,
): `${TEra}_${TReality}_${TAuthority}` => `${era}_${reality}_${authority}`;

export const PERSONALITY_CELLS: Record<CellKey, PersonalityCell> = {
  [cellKey(ERA.CLASSIC, REALITY.REALISTIC, TASTE_AUTHORITY.POPULAR)]: {
    rarityPercent: 16,
    description:
      'Timeless, true-to-life crowd-pleasers — big stakes, bigger heart.',
    default: {
      name: 'Rocky Balboa',
      source: 'Rocky',
      poster: poster('/aYtBYWqCdUqcnoodWJdcTG3pFev.jpg'),
    },
    byGenre: {
      80: {
        name: 'Tony Montana',
        source: 'Scarface',
        poster: poster('/iQ5ztdjvteGeboxtmRdXEChJOHh.jpg'),
      }, // Crime
      28: {
        name: 'John McClane',
        source: 'Die Hard',
        poster: poster('/7Bjd8kfmDSOzpmhySpEhkUyK2oH.jpg'),
      }, // Action
      18: {
        name: 'Forrest Gump',
        source: 'Forrest Gump',
        poster: poster('/Cw4hIUIAmSYfK9QfaUW5igp9La.jpg'),
      }, // Drama
      10749: {
        name: 'Jack Dawson',
        source: 'Titanic',
        poster: poster('/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg'),
      }, // Romance
      35: {
        name: 'Ferris Bueller',
        source: "Ferris Bueller's Day Off",
        poster: poster('/9LTQNCvoLsKXP0LtaKAaYVtRaQL.jpg'),
      }, // Comedy
    },
  },
  [cellKey(ERA.CLASSIC, REALITY.REALISTIC, TASTE_AUTHORITY.CRITICS_CHOICE)]: {
    rarityPercent: 8,
    description: 'Old-world, grounded, and universally revered.',
    default: {
      name: 'Vito Corleone',
      source: 'The Godfather',
      poster: poster('/3bhkrj58Vtu7enYsRolD1fZdja1.jpg'),
    },
    byGenre: {
      18: {
        name: 'Atticus Finch',
        source: 'To Kill a Mockingbird',
        poster: poster('/gZycFUMLx2110dzK3nBNai7gfpM.jpg'),
      }, // Drama
      53: {
        name: 'Hannibal Lecter',
        source: 'The Silence of the Lambs',
        poster: poster('/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg'),
      }, // Thriller
      9648: {
        name: 'Jake Gittes',
        source: 'Chinatown',
        poster: poster('/kZRSP3FmOcq0xnBulqpUQngJUXY.jpg'),
      }, // Mystery
      36: {
        name: 'Oskar Schindler',
        source: "Schindler's List",
        poster: poster('/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg'),
      }, // History
      10752: {
        name: 'Captain Willard',
        source: 'Apocalypse Now',
        poster: poster('/gQB8Y5RCMkv2zwzFHbUJX3kAhvA.jpg'),
      }, // War
    },
  },
  [cellKey(ERA.CLASSIC, REALITY.FANTASY, TASTE_AUTHORITY.POPULAR)]: {
    rarityPercent: 11,
    description: 'Classic adventure and blockbuster wonder.',
    default: {
      name: 'Luke Skywalker',
      source: 'Star Wars',
      poster: poster('/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg'),
    },
    byGenre: {
      12: {
        name: 'Indiana Jones',
        source: 'Raiders of the Lost Ark',
        poster: poster('/ceG9VzoRAVGwivFU403Wc3AHRys.jpg'),
      }, // Adventure
      28: {
        name: 'The Terminator',
        source: 'The Terminator',
        poster: poster('/qvktm0BHcnmDpul4Hz01GIazWPr.jpg'),
      }, // Action
      14: {
        name: 'Aladdin',
        source: 'Aladdin',
        poster: poster('/nlaiczW81kY46GBdfIcTrBIqr8I.jpg'),
      }, // Fantasy
      16: {
        name: 'Simba',
        source: 'The Lion King',
        poster: poster('/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg'),
      }, // Animation
      35: {
        name: 'Marty McFly',
        source: 'Back to the Future',
        poster: poster('/vN5B5WgYscRGcQpVhHl6p9DDTP0.jpg'),
      }, // Comedy
    },
  },
  [cellKey(ERA.CLASSIC, REALITY.FANTASY, TASTE_AUTHORITY.CRITICS_CHOICE)]: {
    rarityPercent: 6,
    description: 'Vintage sci-fi with real craft and cult respect.',
    default: {
      name: 'Ellen Ripley',
      source: 'Alien',
      poster: poster('/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg'),
    },
    byGenre: {
      9648: {
        name: 'Rick Deckard',
        source: 'Blade Runner',
        poster: poster('/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg'),
      }, // Mystery
      27: {
        name: 'Jack Torrance',
        source: 'The Shining',
        poster: poster('/uAR0AWqhQL1hQa69UDEbb2rE5Wx.jpg'),
      }, // Horror
      14: {
        name: 'Edward Scissorhands',
        source: 'Edward Scissorhands',
        poster: poster('/e0FqKFvGPdQNWG8tF9cZBtev9Em.jpg'),
      }, // Fantasy
    },
  },
  [cellKey(ERA.NEW_RELEASE, REALITY.REALISTIC, TASTE_AUTHORITY.POPULAR)]: {
    rarityPercent: 15,
    description: 'Modern, real-world, and impossible to look away from.',
    default: {
      name: 'Jordan Belfort',
      source: 'The Wolf of Wall Street',
      poster: poster('/kW9LmvYHAaS9iA0tHmZVq8hQYoq.jpg'),
    },
    byGenre: {
      28: {
        name: 'John Wick',
        source: 'John Wick',
        poster: poster('/wXqWR7dHncNRbxoEGybEy7QTe9h.jpg'),
      }, // Action
      18: {
        name: 'Jamal Malik',
        source: 'Slumdog Millionaire',
        poster: poster('/5leCCi7ZF0CawAfM5Qo2ECKPprc.jpg'),
      }, // Drama
      35: {
        name: 'Ron Burgundy',
        source: 'Anchorman',
        poster: poster('/mhZIcRePT7U8viFQVjt1ZjYIsR4.jpg'),
      }, // Comedy
      10749: {
        name: 'Noah Calhoun',
        source: 'The Notebook',
        poster: poster('/rNzQyW4f8B8cQeg7Dgj3n6eT5k9.jpg'),
      }, // Romance
      10402: {
        name: 'Freddie Mercury',
        source: 'Bohemian Rhapsody',
        poster: poster('/lHu1wtNaczFPGFDTrjCSzeLPTKN.jpg'),
      }, // Music
    },
  },
  [cellKey(ERA.NEW_RELEASE, REALITY.REALISTIC, TASTE_AUTHORITY.CRITICS_CHOICE)]:
    {
      rarityPercent: 12,
      description: 'New-era prestige — grounded, acclaimed, unforgettable.',
      default: {
        name: 'Walter White',
        source: 'Breaking Bad',
        poster: poster('/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg'),
      },
      byGenre: {
        18: {
          name: 'Tony Soprano',
          source: 'The Sopranos',
          poster: poster('/rTc7ZXdroqjkKivFPvCPX0Ru7uw.jpg'),
        }, // Drama
        53: {
          name: 'Amy Dunne',
          source: 'Gone Girl',
          poster: poster('/ts996lKsxvjkO2yiYG0ht4qAicO.jpg'),
        }, // Thriller
        9648: {
          name: 'Rust Cohle',
          source: 'True Detective',
          poster: poster('/dC7jkj2g1aU8sxKqM6D4g44xA6w.jpg'),
        }, // Mystery
        36: {
          name: 'Valery Legasov',
          source: 'Chernobyl',
          poster: poster('/hlLXt2tOPT6RRnjiUmoxyG1LTFi.jpg'),
        }, // History
      },
    },
  [cellKey(ERA.NEW_RELEASE, REALITY.FANTASY, TASTE_AUTHORITY.POPULAR)]: {
    rarityPercent: 14,
    description: 'Modern spectacle and mass appeal, cape optional.',
    default: {
      name: 'Batman',
      source: 'The Dark Knight',
      poster: poster('/qJ2tW6WMUDux911r6m7haRef0WH.jpg'),
    },
    byGenre: {
      878: {
        name: 'Tony Stark',
        source: 'Iron Man',
        poster: poster('/78lPtwv72eTNqFW9COBYI0dWDJa.jpg'),
      }, // Science Fiction
      14: {
        name: 'Harry Potter',
        source: 'Harry Potter',
        poster: poster('/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg'),
      }, // Fantasy
      12: {
        name: 'Jack Sparrow',
        source: 'Pirates of the Caribbean',
        poster: poster('/poHwCZeWzJCShH7tOjg8RIoyjcw.jpg'),
      }, // Adventure
      16: {
        name: 'Elsa',
        source: 'Frozen',
        poster: poster('/itAKcobTYGpYT8Phwjd8c9hleTo.jpg'),
      }, // Animation
    },
  },
  [cellKey(ERA.NEW_RELEASE, REALITY.FANTASY, TASTE_AUTHORITY.CRITICS_CHOICE)]: {
    rarityPercent: 7,
    description: 'New worlds built with prestige and ambition.',
    default: {
      name: 'Paul Atreides',
      source: 'Dune',
      poster: poster('/gDzOcq0pfeCeqMBwKIJlSmQpjkZ.jpg'),
    },
    byGenre: {
      18: {
        name: 'Cooper',
        source: 'Interstellar',
        poster: poster('/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg'),
      }, // Drama
      53: {
        name: 'Dom Cobb',
        source: 'Inception',
        poster: poster('/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg'),
      }, // Thriller
      14: {
        name: 'Frodo Baggins',
        source: 'The Lord of the Rings',
        poster: poster('/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg'),
      }, // Fantasy
      16: {
        name: 'Chihiro',
        source: 'Spirited Away',
        poster: poster('/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg'),
      }, // Animation
      9648: {
        name: 'Mark Scout',
        source: 'Severance',
        poster: poster('/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg'),
      }, // Mystery
    },
  },
};

export const OMNIVORE: PersonalityCell & { name: string } = {
  name: 'The Omnivore',
  rarityPercent: 0,
  description: 'No single lane — you watch it all. Your taste is wide open.',
  default: { name: 'The Omnivore', source: '', poster: '' },
  byGenre: {},
};
