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
 * Cat characters for the shareable taste reveal.
 *
 * PRESENTATION ONLY. This never feeds the recommendation taste vector.
 *
 * Each `image` is a finished share card — tagline, name, description, rarity
 * and the Meowie mark are drawn into the picture, so the app only shows the
 * picture. The `name` is here for the share message, nothing else.
 */

export type Character = { name: string; image: string };

export type PersonalityGroup = {
  default: Character;
  byGenre: Partial<Record<GenreId, Character>>;
};

export type EraValue = Exclude<EraAnswer, typeof BOTH>;
export type RealityValue = Exclude<RealityAnswer, typeof BOTH>;
export type AuthorityValue = Exclude<AuthorityAnswer, typeof BOTH>;

export type GroupKey = `${EraValue}_${RealityValue}_${AuthorityValue}`;

const cat = (name: string, file: string): Character => ({
  name,
  image: `https://meowie-public.s3.eu-central-1.amazonaws.com/taste/personalities/${file}`,
});

// Builds the group keys below from the answer constants, so changing an answer
// value never touches this file.
const groupKey = <
  TEra extends EraValue,
  TReality extends RealityValue,
  TAuthority extends AuthorityValue,
>(
  era: TEra,
  reality: TReality,
  authority: TAuthority,
): `${TEra}_${TReality}_${TAuthority}` => `${era}_${reality}_${authority}`;

export const PERSONALITY_GROUPS: Record<GroupKey, PersonalityGroup> = {
  [groupKey(ERA.CLASSIC, REALITY.REALISTIC, TASTE_AUTHORITY.POPULAR)]: {
    default: cat('Rocky Pawboa', 'rocky-pawboa.png'),
    byGenre: {
      18: cat('Furrest Gump', 'furrest-gump.png'), // Drama
      80: cat('Tony Meowtana', 'tony-meowtana.png'), // Crime
    },
  },
  [groupKey(ERA.CLASSIC, REALITY.REALISTIC, TASTE_AUTHORITY.CRITICS_CHOICE)]: {
    default: cat('The Catfather', 'the-catfather.png'),
    byGenre: {
      53: cat('Hannibal Licker', 'hannibal-licker.png'), // Thriller
      36: cat('Maximeow', 'maximeow.png'), // History
    },
  },
  [groupKey(ERA.CLASSIC, REALITY.FANTASY, TASTE_AUTHORITY.POPULAR)]: {
    default: cat('Luke Skywhisker', 'luke-skywhisker.png'),
    byGenre: {
      12: cat('Indiana Bones', 'indiana-bones.png'), // Adventure
      16: cat('Simeow', 'simeow.png'), // Animation
    },
  },
  [groupKey(ERA.CLASSIC, REALITY.FANTASY, TASTE_AUTHORITY.CRITICS_CHOICE)]: {
    default: cat('Ripurr', 'ripurr.png'),
    byGenre: {
      27: cat('Jack Scratchrance', 'jack-scratchrance.png'), // Horror
      14: cat('Edward Scissorpaws', 'edward-scissorpaws.png'), // Fantasy
    },
  },
  [groupKey(ERA.NEW_RELEASE, REALITY.REALISTIC, TASTE_AUTHORITY.POPULAR)]: {
    default: cat('Wolf of Wool Street', 'wolf-of-wool-street.png'),
    byGenre: {
      28: cat('John Whisk', 'john-whisk.png'), // Action
      10402: cat('Freddie Purrcury', 'freddie-purrcury.png'), // Music
    },
  },
  [groupKey(
    ERA.NEW_RELEASE,
    REALITY.REALISTIC,
    TASTE_AUTHORITY.CRITICS_CHOICE,
  )]: {
    default: cat('Heisenpurr', 'heisenpurr.png'),
    byGenre: {
      18: cat('Tony Sopurrano', 'tony-sopurrano.png'), // Drama
      9648: cat('Rust Clawle', 'rust-clawle.png'), // Mystery
    },
  },
  [groupKey(ERA.NEW_RELEASE, REALITY.FANTASY, TASTE_AUTHORITY.POPULAR)]: {
    default: cat('The Dark Kitten', 'the-dark-kitten.png'),
    byGenre: {
      878: cat('Iron Cat', 'iron-cat.png'), // Science Fiction
      14: cat('Hairy Pawter', 'hairy-pawter.png'), // Fantasy
    },
  },
  [groupKey(ERA.NEW_RELEASE, REALITY.FANTASY, TASTE_AUTHORITY.CRITICS_CHOICE)]:
    {
      default: cat('Paw Atreides', 'paw-atreides.png'),
      byGenre: {
        14: cat('Furrodo Bagpaws', 'furrodo-bagpaws.png'), // Fantasy
        53: cat('Dream Whisker', 'dream-whisker.png'), // Thriller
      },
    },
};

// Shown only when all three main questions were answered 'both', so there is
// nothing stated to place the user in a group.
export const EVERYTHING_CAT = cat('The Cativore', 'the-cativore.png');
