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

export type EraValue = Exclude<EraAnswer, typeof BOTH>;
export type AuthorityValue = Exclude<AuthorityAnswer, typeof BOTH>;

/**
 * How the user went through the deck, which says something the genres don't:
 * a hard-to-please rater is a different person from one who likes everything.
 */
export type Trait = 'hard-to-please' | 'easy-going' | 'lots-left-to-watch';

/**
 * What a cat stands for. Every field is a leaning, not a rule — a cat is picked
 * by how well it fits, so an empty field simply never adds anything.
 */
export type Cat = Personality & {
  genres: GenreId[];
  era?: EraValue;
  authority?: AuthorityValue;
  trait?: Trait;
  // Breaks ties, and nothing else. A rare cat is more fun to be given, so it
  // wins when two cats fit equally well.
  rarity: number;
};

const image = (file: string) =>
  `https://meowie-public.s3.eu-central-1.amazonaws.com/taste/personalities/${file}`;

const cat = (
  name: string,
  file: string,
  profile: Omit<Cat, 'name' | 'image'>,
): Cat => ({ name, image: image(file), ...profile });

export const CATS: Cat[] = [
  cat('Luke Skywhisker', 'luke-skywhisker.png', {
    genres: [878, 12],
    era: 'classic',
    authority: 'popular',
    rarity: 1,
  }),
  cat('The Catfather', 'the-catfather.png', {
    genres: [80],
    era: 'classic',
    authority: 'critics-choice',
    trait: 'hard-to-please',
    rarity: 2,
  }),
  cat('The Dark Kitten', 'the-dark-kitten.png', {
    genres: [28, 53],
    era: 'new-release',
    authority: 'popular',
    rarity: 1,
  }),
  cat('Heisenpurr', 'heisenpurr.png', {
    genres: [80, 18],
    era: 'new-release',
    authority: 'critics-choice',
    rarity: 2,
  }),
  cat('Furrest Gump', 'furrest-gump.png', {
    genres: [18],
    era: 'classic',
    authority: 'popular',
    trait: 'easy-going',
    rarity: 1,
  }),
  cat('Tony Meowtana', 'tony-meowtana.png', {
    genres: [80],
    era: 'classic',
    authority: 'popular',
    rarity: 2,
  }),
  cat('Indiana Bones', 'indiana-bones.png', {
    genres: [12],
    era: 'classic',
    authority: 'popular',
    trait: 'lots-left-to-watch',
    rarity: 2,
  }),
  cat('Simeow', 'simeow.png', {
    genres: [16],
    era: 'classic',
    authority: 'popular',
    trait: 'easy-going',
    rarity: 2,
  }),
  cat('Hannibal Licker', 'hannibal-licker.png', {
    genres: [53],
    era: 'classic',
    authority: 'critics-choice',
    trait: 'hard-to-please',
    rarity: 3,
  }),
  cat('Maximeow', 'maximeow.png', {
    genres: [36],
    era: 'classic',
    authority: 'popular',
    rarity: 2,
  }),
  cat('Jack Scratchrance', 'jack-scratchrance.png', {
    genres: [27],
    era: 'classic',
    authority: 'critics-choice',
    rarity: 3,
  }),
  cat('Edward Scissorpaws', 'edward-scissorpaws.png', {
    genres: [14],
    era: 'classic',
    authority: 'critics-choice',
    rarity: 3,
  }),
  cat('John Whisk', 'john-whisk.png', {
    genres: [28],
    era: 'new-release',
    authority: 'popular',
    rarity: 1,
  }),
  cat('Freddie Purrcury', 'freddie-purrcury.png', {
    genres: [10402],
    era: 'new-release',
    authority: 'popular',
    rarity: 3,
  }),
  cat('Iron Cat', 'iron-cat.png', {
    genres: [878],
    era: 'new-release',
    authority: 'popular',
    rarity: 1,
  }),
  cat('Hairy Pawter', 'hairy-pawter.png', {
    genres: [14],
    era: 'new-release',
    authority: 'popular',
    trait: 'lots-left-to-watch',
    rarity: 1,
  }),
  cat('Tony Sopurrano', 'tony-sopurrano.png', {
    genres: [18, 80],
    era: 'classic',
    authority: 'critics-choice',
    rarity: 2,
  }),
  cat('Rust Clawle', 'rust-clawle.png', {
    genres: [9648],
    era: 'new-release',
    authority: 'critics-choice',
    trait: 'hard-to-please',
    rarity: 3,
  }),
  cat('Furrodo Bagpaws', 'furrodo-bagpaws.png', {
    genres: [14, 12],
    era: 'new-release',
    authority: 'popular',
    rarity: 2,
  }),
  cat('Dream Whisker', 'dream-whisker.png', {
    genres: [53, 878],
    era: 'new-release',
    authority: 'critics-choice',
    rarity: 3,
  }),
  cat('Rocky Pawboa', 'rocky-pawboa.png', {
    genres: [18, 10751],
    era: 'classic',
    authority: 'popular',
    rarity: 2,
  }),
  cat('Ripurr', 'ripurr.png', {
    genres: [878, 27],
    era: 'classic',
    authority: 'critics-choice',
    trait: 'hard-to-please',
    rarity: 3,
  }),
  cat('Wolf of Wool Street', 'wolf-of-wool-street.png', {
    genres: [80, 35],
    era: 'new-release',
    authority: 'popular',
    rarity: 2,
  }),
  cat('Paw Atreides', 'paw-atreides.png', {
    genres: [878],
    era: 'new-release',
    authority: 'critics-choice',
    rarity: 3,
  }),
];

// Given when nothing else fits: no titles liked and no side taken.
export const EVERYTHING_CAT: Personality = {
  name: 'The Cativore',
  image: image('the-cativore.png'),
};
