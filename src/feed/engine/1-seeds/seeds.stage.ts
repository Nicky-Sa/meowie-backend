import {
  LIBRARY_SEED_PRIORITY,
  TASTE_SEED_PRIORITY,
} from '@/feed/engine/constants/feed.constant';
import {
  SeedsStageInput,
  SeedsStageOutput,
} from '@/feed/engine/1-seeds/seeds.types';
import { joinSeedSources, pickWalkSeeds } from '@/feed/engine/1-seeds/helpers';
import { librarySource } from '@/feed/engine/1-seeds/library.source';
import { tasteSource } from '@/feed/engine/1-seeds/taste.source';
import { Stage } from '@/feed/engine/engine.type';

/**
 * Stage 1 of the feed pipeline.
 *
 * Taste and library sources become the full seed list for later filtering.
 * Positive and negative seeds are picked separately for the two walks.
 */
const run = ({
  tasteRatings,
  libraryItems,
  now = new Date(),
}: SeedsStageInput): SeedsStageOutput => {
  const allSeeds = joinSeedSources([
    {
      priority: TASTE_SEED_PRIORITY,
      items: tasteSource({ tasteRatings }),
    },
    {
      priority: LIBRARY_SEED_PRIORITY,
      items: librarySource({ libraryItems, now }),
    },
  ]);

  const { positiveSeeds, negativeSeeds } = pickWalkSeeds(allSeeds);

  return { allSeeds, positiveSeeds, negativeSeeds };
};

export const seedsStage: Stage<SeedsStageInput, SeedsStageOutput> = { run };
