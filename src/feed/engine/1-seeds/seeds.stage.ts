import {
  LIBRARY_SEED_PRIORITY,
  MAX_DISLIKED_SEEDS,
  MAX_LIKED_SEEDS,
  SAVED_SEED_WEIGHT,
  SEEN_UNRATED_SEED_WEIGHT,
  TASTE_DISLIKE_SEED_WEIGHT,
  TASTE_LIKE_SEED_WEIGHT,
  TASTE_SEED_PRIORITY,
} from '@/feed/engine/constants/feed.constant';
import {
  LibrarySeedItem,
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
 * Builds Stage 1's output from one media type's taste answers and library rows.
 * The result keeps every known title in `allSeeds` and selects the positive and
 * negative walk inputs separately.
 */
const run = (input: SeedsInput): SeedsOutput => {
  const allSeeds = joinSeeds([
    {
      priority: TASTE_SEED_PRIORITY,
      items: seedsFromTaste(input.tasteRatings),
    },
    {
      priority: LIBRARY_SEED_PRIORITY,
      items: seedsFromLibrary(input.libraryItems),
    },
  ]);
  const { likedSeeds, dislikedSeeds } = pickSeeds(allSeeds);

  return { allSeeds, likedSeeds, dislikedSeeds };
};

export const seedsStage: Stage<SeedsInput, SeedsOutput> = { run };

// helper pure functions

const seedsFromTaste = (ratings: TitleRatings): Seed[] =>
  Object.entries(ratings)
    .filter(([, answer]) => answer !== 'not-seen')
    .map(([id, answer]) => ({
      id: Number(id),
      weight:
        answer === 'like' ? TASTE_LIKE_SEED_WEIGHT : TASTE_DISLIKE_SEED_WEIGHT,
    }));

const seedsFromLibrary = (items: LibrarySeedItem[]): Seed[] =>
  items.map(
    (item): Seed => ({
      id: item.tmdbId,
      weight:
        item.rating !== null
          ? weightForRating(item.rating)
          : item.category === 'saved'
            ? SAVED_SEED_WEIGHT
            : SEEN_UNRATED_SEED_WEIGHT,
    }),
  );

const weightForRating = (rating: number): number => {
  const midpoint = (LOWEST_RATING + HIGHEST_RATING) / 2;
  return (rating - midpoint) / (HIGHEST_RATING - midpoint);
};

/** When two lists hold the same title, priority 1 beats priority 2. */
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

const pickSeeds = (seeds: Seed[]): Omit<SeedsOutput, 'allSeeds'> => ({
  likedSeeds: seeds
    .filter((seed) => seed.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_LIKED_SEEDS),
  dislikedSeeds: seeds
    .filter((seed) => seed.weight < 0)
    .sort((a, b) => a.weight - b.weight)
    .slice(0, MAX_DISLIKED_SEEDS),
});
