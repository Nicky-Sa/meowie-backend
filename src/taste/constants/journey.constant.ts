import { GenreId } from '@/taste/constants/pools.constant';

export type GenreChip = {
  id: GenreId;
  example: string;
};

export type TasteAxis = 'era' | 'reality' | 'tasteAuthority' | 'commitment';

// Single source of truth for the answer values: change a value in one of
// these objects and every consumer (questions, DTO validation, feed scorers,
// personality cells) follows at compile time.
export const BOTH = 'both' as const;

export const ERA = {
  CLASSIC: 'classic',
  NEW_RELEASE: 'new-release',
  BOTH,
} as const;

export const REALITY = {
  REALISTIC: 'realistic',
  FANTASY: 'fantasy',
  BOTH,
} as const;

export const TASTE_AUTHORITY = {
  POPULAR: 'popular',
  CRITICS_CHOICE: 'critics-choice',
  BOTH,
} as const;

export const COMMITMENT = {
  SHORT: 'short',
  LONG: 'long',
  BOTH,
} as const;

export const ANSWER_VALUES = {
  era: [ERA.CLASSIC, ERA.NEW_RELEASE, ERA.BOTH],
  reality: [REALITY.REALISTIC, REALITY.FANTASY, REALITY.BOTH],
  tasteAuthority: [
    TASTE_AUTHORITY.POPULAR,
    TASTE_AUTHORITY.CRITICS_CHOICE,
    TASTE_AUTHORITY.BOTH,
  ],
  commitment: [COMMITMENT.SHORT, COMMITMENT.LONG, COMMITMENT.BOTH],
} as const;

export type AnswerFor<TAxis extends TasteAxis> =
  (typeof ANSWER_VALUES)[TAxis][number];

export type EraAnswer = AnswerFor<'era'>;
export type RealityAnswer = AnswerFor<'reality'>;
export type AuthorityAnswer = AnswerFor<'tasteAuthority'>;
export type CommitmentAnswer = AnswerFor<'commitment'>;

export type TasteOption<TValue extends string = string> = {
  label: string;
  description?: string;
  value: TValue;
};

export type TasteQuestion<TAxis extends TasteAxis = TasteAxis> = {
  id: TAxis;
  axis: string;
  prompt: string;
  sideA: TasteOption<Exclude<AnswerFor<TAxis>, typeof BOTH>>;
  sideB: TasteOption<Exclude<AnswerFor<TAxis>, typeof BOTH>>;
  both: TasteOption<Extract<AnswerFor<TAxis>, typeof BOTH>>;
};

export const GENRE_CHIPS: GenreChip[] = [
  { id: 28, example: 'Mad Max, Dark Knight' }, // Action
  { id: 12, example: 'Dune, The Fall' }, // Adventure
  { id: 16, example: 'Spirited Away' }, // Animation
  { id: 35, example: 'Fleabag, The Bear' }, // Comedy
  { id: 80, example: 'True Detective' }, // Crime
  { id: 99, example: 'real events' }, // Documentary
  { id: 18, example: 'Parasite, Succession' }, // Drama
  { id: 10751, example: 'all-ages' }, // Family
  { id: 14, example: 'The Fall' }, // Fantasy
  { id: 36, example: 'Chernobyl, Shogun' }, // History
  { id: 27, example: 'scares, dread' }, // Horror
  { id: 10402, example: 'La La Land' }, // Music
  { id: 9648, example: 'Dark, Coherence' }, // Mystery
  { id: 10749, example: 'La La Land' }, // Romance
  { id: 878, example: 'Interstellar' }, // Science Fiction
  { id: 53, example: 'Blue Ruin' }, // Thriller
  { id: 10752, example: 'conflict' }, // War
  { id: 37, example: 'frontier' }, // Western
];

export const TASTE_QUESTIONS: [
  TasteQuestion<'era'>,
  TasteQuestion<'reality'>,
  TasteQuestion<'tasteAuthority'>,
  TasteQuestion<'commitment'>,
] = [
  {
    id: 'era',
    axis: 'Era',
    prompt: 'Older classics, or newer releases?',
    sideA: {
      label: 'Classics',
      description: 'Older, timeless picks',
      value: ERA.CLASSIC,
    },
    sideB: {
      label: 'New releases',
      description: 'Recent and current',
      value: ERA.NEW_RELEASE,
    },
    both: {
      label: 'No preference',
      description: 'I like both',
      value: BOTH,
    },
  },
  {
    id: 'reality',
    axis: 'Reality',
    prompt: 'Real-life stories, or fantasy worlds?',
    sideA: {
      label: 'Realistic',
      description: 'Real, believable, true to life',
      value: REALITY.REALISTIC,
    },
    sideB: {
      label: 'Fantasy',
      description: 'Escapist, sci-fi, the unreal',
      value: REALITY.FANTASY,
    },
    both: {
      label: 'No preference',
      description: 'I like both',
      value: BOTH,
    },
  },
  {
    id: 'tasteAuthority',
    axis: 'Taste',
    prompt: 'What everyone loves, or what the critics pick?',
    sideA: {
      label: 'Most Popular',
      description: "What everyone's watching",
      value: TASTE_AUTHORITY.POPULAR,
    },
    sideB: {
      label: "Critics' Choice",
      description: 'Highly rated, award winning',
      value: TASTE_AUTHORITY.CRITICS_CHOICE,
    },
    both: {
      label: 'No preference',
      description: 'I like both',
      value: BOTH,
    },
  },
  {
    id: 'commitment',
    axis: 'Commitment',
    prompt: 'Short and sweet, or long and epic?',
    sideA: {
      label: 'Short & mini',
      description: 'Quick films, limited series',
      value: COMMITMENT.SHORT,
    },
    sideB: {
      label: 'Long & epic',
      description: 'Long films, many seasons',
      value: COMMITMENT.LONG,
    },
    both: {
      label: 'No preference',
      description: 'I like both',
      value: BOTH,
    },
  },
];

export const AVOID_CHIPS = [
  'Horror',
  'Gore',
  'Very long commitment',
  'Reality TV',
  'Anime',
  'War',
  'Kids content',
  'Soap opera',
] as const;

// The feed's avoid-rule map is keyed by this, so renaming a chip in one place
// but not the other fails to compile.
export type AvoidChip = (typeof AVOID_CHIPS)[number];

// What "classic" and "new release" mean in years, product-wide.
export const CLASSIC_MAX_YEAR = 1999;
export const MODERN_MIN_YEAR = 2015;

// Genre families behind the grounded/escapist answer (movie + TV genre ids).
export const GROUNDED_GENRE_IDS = [99, 36, 10752, 10768, 80, 18];
export const ESCAPIST_GENRE_IDS = [878, 14, 10765, 16];

export const DEFAULT_EXPLORE_LEVEL = 2; // "Balanced"

export const EXPLORE_LEVELS: string[] = [
  'Stick to what I love',
  'Mostly familiar',
  'Balanced',
  'Lean into new',
  'Surprise me',
];

/**
 * Hand-tuned fallback genre rarity weights, roughly inverse to genre
 * frequency. The live values come from GenreRarityService, which counts the
 * TMDB catalog; this table only serves when TMDB can't be reached.
 */
export const RARITY_WEIGHTS: Record<GenreId, number> = {
  18: 0.5, // Drama
  35: 0.6, // Comedy
  28: 0.7, // Action
  53: 0.7, // Thriller
  12: 0.8, // Adventure
  10749: 0.8, // Romance
  80: 0.9, // Crime
  10751: 0.9, // Family
  9648: 1.0, // Mystery
  878: 1.1, // Science Fiction
  27: 1.1, // Horror
  14: 1.2, // Fantasy
  16: 1.3, // Animation
  99: 1.3, // Documentary
  10752: 1.4, // War
  10402: 1.5, // Music
  36: 1.6, // History
  37: 1.8, // Western
};

export const AUTO_SELECT_THRESHOLD = 1.6;
