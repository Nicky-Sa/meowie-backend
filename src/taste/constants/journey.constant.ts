import { Option } from '@/types/option';

// What the user can say about one poster. "not-seen" is kept so the deck can
// show their answer again, but it says nothing about their taste.
export const TITLE_ANSWERS = ['like', 'dislike', 'not-seen'] as const;

export type TitleAnswer = (typeof TITLE_ANSWERS)[number];

// TMDB id → what the user said about it. JSON object keys are strings, so the
// ids come back as strings and are turned into numbers where they are read.
export type TitleRatings = Record<number, TitleAnswer>;

// Stored rows hold the id, never the label, so a label can be reworded
// without orphaning what users already picked.
export const AVOID_CHIPS = [
  { id: 'horror', label: 'Horror' },
  { id: 'gore', label: 'Gore' },
  { id: 'anime', label: 'Anime' },
  { id: 'war', label: 'War' },
  { id: 'documentaries', label: 'Documentaries' },
  { id: 'musicals', label: 'Musicals' },
] as const satisfies readonly AvoidChip[];

export type AvoidId = (typeof AVOID_CHIPS)[number]['id'];
export type AvoidChip = Option<string>;

export const AVOID_IDS: AvoidId[] = AVOID_CHIPS.map((chip) => chip.id);

export const MIN_MOVIES_TO_LIKE = 5;
