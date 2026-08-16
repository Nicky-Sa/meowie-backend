import {
  LIBRARY_SEED_HALF_LIFE_MONTHS,
  LIBRARY_SEED_PRIORITY,
  MAX_NEGATIVE_SEEDS,
  MAX_POSITIVE_SEEDS,
  SAVED_SEED_WEIGHT,
  SEEN_UNRATED_SEED_WEIGHT,
  TASTE_DISLIKE_SEED_WEIGHT,
  TASTE_LIKE_SEED_WEIGHT,
  TASTE_SEED_PRIORITY,
} from '@/feed/engine/constants/feed.constant';
import {
  LibrarySeedItem,
  LibraryWeightModifier,
  Seed,
  SeedList,
  SeedsInput,
  SeedsOutput,
} from '@/feed/engine/1-seeds/seed.types';
import { Stage } from '@/feed/engine/stage.type';
import {
  HIGHEST_RATING,
  LOWEST_RATING,
} from '@/library/constants/library.constants';
import { TitleRatings } from '@/taste/constants/journey.constant';

/**
 * Builds the seed list from the user's taste answers and library.
 *
 * The full list is kept for filtering later. Positive and negative seeds are
 * picked separately for the two walks.
 */
const run = ({
  tasteRatings,
  libraryItems,
  now = new Date(),
}: SeedsInput): SeedsOutput => {
  const allSeeds = joinSeeds([
    {
      priority: TASTE_SEED_PRIORITY,
      items: seedsFromTaste(tasteRatings),
    },
    {
      priority: LIBRARY_SEED_PRIORITY,
      items: seedsFromLibrary(libraryItems, now),
    },
  ]);

  const { positiveSeeds, negativeSeeds } = pickSeeds(allSeeds);

  return { allSeeds, positiveSeeds, negativeSeeds };
};

export const seedsStage: Stage<SeedsInput, SeedsOutput> = { run };

// Helpers

/**
 * Turns taste-deck answers into seeds.
 *
 * `like` and `dislike` become fixed positive and negative weights. `not-seen`
 * is ignored because it gives us no information about the user's taste.
 */
const seedsFromTaste = (ratings: TitleRatings): Seed[] =>
  Object.entries(ratings)
    .filter(([, answer]) => answer !== 'not-seen')
    .map(([id, answer]) => ({
      id: Number(id),
      weight:
        answer === 'like' ? TASTE_LIKE_SEED_WEIGHT : TASTE_DISLIKE_SEED_WEIGHT,
    }));

/**
 * Turns library items into seeds.
 *
 * The item's rating, or its saved/seen state when it has no rating, determines
 * its starting weight. The library weight modifiers are then applied in order.
 */
const seedsFromLibrary = (items: LibrarySeedItem[], now: Date): Seed[] =>
  items.map((item) => ({
    id: item.tmdbId,
    weight: getLibraryWeight(item, now),
  }));

/**
 * Calculates the starting weight for a library item before any modifiers.
 *
 * A rated item gets its weight from the rating. An unrated saved item gets the
 * saved weight, while an unrated seen item gets the weaker seen weight.
 */
const getBaseLibraryWeight = (item: LibrarySeedItem): number => {
  if (item.rating !== null) {
    return weightForRating(item.rating);
  }

  return item.category === 'saved'
    ? SAVED_SEED_WEIGHT
    : SEEN_UNRATED_SEED_WEIGHT;
};

/**
 * Calculates the final weight for a library item.
 *
 * Starts with the item's base weight and applies each library weight modifier
 * in order. This keeps the individual factors separate so more modifiers can
 * be added later without changing how the base weight is calculated.
 */
const getLibraryWeight = (item: LibrarySeedItem, now: Date): number => {
  const baseWeight = getBaseLibraryWeight(item);

  return libraryWeightModifiers.reduce(
    (weight, modifier) => modifier(weight, item, now),
    baseWeight,
  );
};

/**
 * Converts a 1–10 library rating into a weight from -1 to +1.
 *
 * The midpoint of the rating scale becomes zero, with the lowest rating at
 * -1 and the highest rating at +1.
 */
const weightForRating = (rating: number): number => {
  const midpoint = (LOWEST_RATING + HIGHEST_RATING) / 2;
  return (rating - midpoint) / (HIGHEST_RATING - midpoint);
};

/**
 * Reduces a library item's weight as the item gets older.
 *
 * The weight is cut in half for every `LIBRARY_SEED_HALF_LIFE_MONTHS` months
 * since the item was added to the library.
 */
const applyRecency: LibraryWeightModifier = (weight, item, now): number => {
  const monthsSinceAction = Math.max(
    0,
    (now.getTime() - item.createdAt.getTime()) /
      (1000 * 60 * 60 * 24 * 30.4375),
  );

  // the older the item -> the larger the denominator -> the smaller the output
  return weight / 2 ** (monthsSinceAction / LIBRARY_SEED_HALF_LIFE_MONTHS);
};

const libraryWeightModifiers: LibraryWeightModifier[] = [applyRecency];

/**
 * Combines seed lists from different sources.
 *
 * When the same title appears in multiple lists, the lower priority number
 * wins. The winning entry completely replaces the other entry; weights are
 * never added together.
 */
const joinSeeds = (seedLists: SeedList[]): Seed[] => {
  const weightsById = new Map<number, number>();

  // sort in descending order, so higher priority comes "later"
  const orderedLists = [...seedLists].sort((a, b) => b.priority - a.priority);

  for (const { items } of orderedLists) {
    for (const { id, weight } of items) {
      weightsById.set(id, weight); // the last .set wins (the orderedLists is sorted descendingly, so the higher priority which is the lower the number)
    }
  }

  return [...weightsById].map(([id, weight]) => ({ id, weight }));
};

/**
 * Selects the strongest positive and negative seeds for the walks.
 *
 * Positive seeds are sorted from strongest to weakest. Negative seeds are
 * sorted from most negative to least negative. Each list is capped separately.
 */
const pickSeeds = (
  seeds: Seed[],
): Pick<SeedsOutput, 'positiveSeeds' | 'negativeSeeds'> => ({
  positiveSeeds: seeds
    .filter((seed) => seed.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_POSITIVE_SEEDS),

  negativeSeeds: seeds
    .filter((seed) => seed.weight < 0)
    .sort((a, b) => a.weight - b.weight)
    .slice(0, MAX_NEGATIVE_SEEDS),
});
