import {
  LIBRARY_SEED_HALF_LIFE_MONTHS,
  SAVED_SEED_WEIGHT,
  SEEN_UNRATED_SEED_WEIGHT,
} from '@/feed/engine/constants/feed.constant';
import {
  LibrarySeedItem,
  LibrarySourceInput,
  LibrarySourceOutput,
  LibraryWeightModifier,
} from '@/feed/engine/1-seeds/library.types';
import {
  HIGHEST_RATING,
  LOWEST_RATING,
} from '@/library/constants/library.constants';

/** Turns library rows into recency-weighted seeds. */
export const librarySource = ({
  libraryItems,
  now,
}: LibrarySourceInput): LibrarySourceOutput =>
  libraryItems.map((item) => ({
    id: item.tmdbId,
    weight: getLibraryWeight(item, now),
  }));

/** Calculates the starting weight for a library item before modifiers. */
const getBaseLibraryWeight = (item: LibrarySeedItem): number => {
  if (item.rating !== null) {
    return weightForRating(item.rating);
  }

  return item.category === 'saved'
    ? SAVED_SEED_WEIGHT
    : SEEN_UNRATED_SEED_WEIGHT;
};

/** Calculates the final weight after all library modifiers. */
const getLibraryWeight = (item: LibrarySeedItem, now: Date): number =>
  libraryWeightModifiers.reduce(
    (weight, modifier) => modifier(weight, item, now),
    getBaseLibraryWeight(item),
  );

/** Converts a 1–10 library rating into a weight from -1 to +1. */
const weightForRating = (rating: number): number => {
  const midpoint = (LOWEST_RATING + HIGHEST_RATING) / 2;
  return (rating - midpoint) / (HIGHEST_RATING - midpoint);
};

/** Reduces a library item's weight by half every configured number of months. */
const applyRecency: LibraryWeightModifier = (weight, item, now): number => {
  const monthsSinceAction = Math.max(
    0,
    (now.getTime() - item.createdAt.getTime()) /
      (1000 * 60 * 60 * 24 * 30.4375),
  );

  return weight / 2 ** (monthsSinceAction / LIBRARY_SEED_HALF_LIFE_MONTHS);
};

const libraryWeightModifiers: LibraryWeightModifier[] = [applyRecency];
