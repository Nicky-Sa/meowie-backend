import { GenreId } from '@/taste/constants/pools.constant';
import {
  AuthorityAnswer,
  BOTH,
  EraAnswer,
} from '@/taste/constants/journey.constant';

/**
 * Cat cards for the shareable taste reveal. Each `image` is the finished card
 * — name, tagline and rarity are drawn into the picture, so the app only shows
 * the picture and uses `name` for the share message.
 */
export type Personality = { name: string; image: string };

export type PersonalityGroup = {
  default: Personality;
  byGenre: Partial<Record<GenreId, Personality>>;
};

export type EraValue = Exclude<EraAnswer, typeof BOTH>;
export type AuthorityValue = Exclude<AuthorityAnswer, typeof BOTH>;

export type GroupKey = `${EraValue}_${AuthorityValue}`;

const cat = (name: string, file: string): Personality => ({
  name,
  image: `https://meowie-public.s3.eu-central-1.amazonaws.com/taste/personalities/${file}`,
});

export const PERSONALITY_GROUPS: Record<GroupKey, PersonalityGroup> = {
  classic_popular: {
    default: cat('Luke Skywhisker', 'luke-skywhisker.png'),
    byGenre: {
      18: cat('Furrest Gump', 'furrest-gump.png'), // Drama
      80: cat('Tony Meowtana', 'tony-meowtana.png'), // Crime
      12: cat('Indiana Bones', 'indiana-bones.png'), // Adventure
      16: cat('Simeow', 'simeow.png'), // Animation
    },
  },
  'classic_critics-choice': {
    default: cat('The Catfather', 'the-catfather.png'),
    byGenre: {
      53: cat('Hannibal Licker', 'hannibal-licker.png'), // Thriller
      36: cat('Maximeow', 'maximeow.png'), // History
      27: cat('Jack Scratchrance', 'jack-scratchrance.png'), // Horror
      14: cat('Edward Scissorpaws', 'edward-scissorpaws.png'), // Fantasy
    },
  },
  'new-release_popular': {
    default: cat('The Dark Kitten', 'the-dark-kitten.png'),
    byGenre: {
      28: cat('John Whisk', 'john-whisk.png'), // Action
      10402: cat('Freddie Purrcury', 'freddie-purrcury.png'), // Music
      878: cat('Iron Cat', 'iron-cat.png'), // Science Fiction
      14: cat('Hairy Pawter', 'hairy-pawter.png'), // Fantasy
    },
  },
  'new-release_critics-choice': {
    default: cat('Heisenpurr', 'heisenpurr.png'),
    byGenre: {
      18: cat('Tony Sopurrano', 'tony-sopurrano.png'), // Drama
      9648: cat('Rust Clawle', 'rust-clawle.png'), // Mystery
      14: cat('Furrodo Bagpaws', 'furrodo-bagpaws.png'), // Fantasy
      53: cat('Dream Whisker', 'dream-whisker.png'), // Thriller
    },
  },
};

// Shown only when both main questions were answered 'both', so there is
// nothing stated to place the user in a group.
export const EVERYTHING_CAT = cat('The Cativore', 'the-cativore.png');
