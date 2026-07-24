import { GenreId } from '@/taste/constants/pools.constant';
import { Option } from '@/types/option';

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

export type TasteQuestion<TAxis extends TasteAxis = TasteAxis> = {
  id: TAxis;
  axis: string;
  prompt: string;
  sideA: Option<Exclude<AnswerFor<TAxis>, typeof BOTH>>;
  sideB: Option<Exclude<AnswerFor<TAxis>, typeof BOTH>>;
  both: Option<Extract<AnswerFor<TAxis>, typeof BOTH>>;
};

export const GENRE_IDS: GenreId[] = [
  28, // Action
  12, // Adventure
  16, // Animation
  35, // Comedy
  80, // Crime
  99, // Documentary
  18, // Drama
  10751, // Family
  14, // Fantasy
  36, // History
  27, // Horror
  10402, // Music
  9648, // Mystery
  10749, // Romance
  878, // Science Fiction
  53, // Thriller
  10752, // War
  37, // Western
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
      id: ERA.CLASSIC,
    },
    sideB: {
      label: 'New releases',
      description: 'Recent and current',
      id: ERA.NEW_RELEASE,
    },
    both: {
      label: 'No preference',
      description: 'I like both',
      id: BOTH,
    },
  },
  {
    id: 'reality',
    axis: 'Reality',
    prompt: 'Real-life stories, or fantasy worlds?',
    sideA: {
      label: 'Realistic',
      description: 'Real, believable, true to life',
      id: REALITY.REALISTIC,
    },
    sideB: {
      label: 'Fantasy',
      description: 'Escapist, sci-fi, the unreal',
      id: REALITY.FANTASY,
    },
    both: {
      label: 'No preference',
      description: 'I like both',
      id: BOTH,
    },
  },
  {
    id: 'tasteAuthority',
    axis: 'Taste',
    prompt: 'What everyone loves, or what the critics pick?',
    sideA: {
      label: 'Most Popular',
      description: "What everyone's watching",
      id: TASTE_AUTHORITY.POPULAR,
    },
    sideB: {
      label: "Critics' Choice",
      description: 'Highly rated, award winning',
      id: TASTE_AUTHORITY.CRITICS_CHOICE,
    },
    both: {
      label: 'No preference',
      description: 'I like both',
      id: BOTH,
    },
  },
  {
    id: 'commitment',
    axis: 'Commitment',
    prompt: 'Short and sweet, or long and epic?',
    sideA: {
      label: 'Short & mini',
      description: 'Quick films, limited series',
      id: COMMITMENT.SHORT,
    },
    sideB: {
      label: 'Long & epic',
      description: 'Long films, many seasons',
      id: COMMITMENT.LONG,
    },
    both: {
      label: 'No preference',
      description: 'I like both',
      id: BOTH,
    },
  },
];

export const AVOID_CHIPS = [
  { id: 'horror', label: 'Horror' },
  { id: 'gore', label: 'Gore' },
  { id: 'long-watches', label: 'Long watches' },
  { id: 'reality-tv', label: 'Reality TV' },
  { id: 'anime', label: 'Anime' },
  { id: 'war', label: 'War' },
  { id: 'kids-content', label: 'Kids content' },
  { id: 'soap-opera', label: 'Soap opera' },
] as const;

// Stored rows hold the id, never the label, so a label can be reworded
// without orphaning what users already picked.
export type AvoidId = (typeof AVOID_CHIPS)[number]['id'];
export type AvoidChip = Option<AvoidId>;

export const AVOID_IDS: AvoidId[] = AVOID_CHIPS.map((chip) => chip.id);

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
