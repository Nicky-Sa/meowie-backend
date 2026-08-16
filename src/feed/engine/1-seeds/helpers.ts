import {
  MAX_NEGATIVE_SEEDS,
  MAX_POSITIVE_SEEDS,
} from '@/feed/engine/constants/feed.constant';
import {
  SeedSource,
  SeedsStageOutput,
} from '@/feed/engine/1-seeds/seeds.types';
import { Seed } from '@/feed/engine/engine.type';

/**
 * Joins seed sources, letting the lowest priority number replace duplicates.
 * Weights from matching titles are never added together.
 */
export const joinSeedSources = (seedSources: SeedSource[]): Seed[] => {
  const weightsById = new Map<number, number>();
  const orderedSources = [...seedSources].sort(
    (a, b) => b.priority - a.priority,
  );

  for (const { items } of orderedSources) {
    for (const { id, weight } of items) {
      weightsById.set(id, weight);
    }
  }

  return [...weightsById].map(([id, weight]) => ({ id, weight }));
};

/** Picks the strongest positive and negative seeds for their separate walks. */
export const pickWalkSeeds = (
  seeds: Seed[],
): Pick<SeedsStageOutput, 'positiveSeeds' | 'negativeSeeds'> => ({
  positiveSeeds: seeds
    .filter((seed) => seed.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_POSITIVE_SEEDS),

  negativeSeeds: seeds
    .filter((seed) => seed.weight < 0)
    .sort((a, b) => a.weight - b.weight)
    .slice(0, MAX_NEGATIVE_SEEDS),
});
