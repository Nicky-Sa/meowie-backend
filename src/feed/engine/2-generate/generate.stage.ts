import { popularSource } from '@/feed/engine/2-generate/popular.source';
import {
  GenerateStageInput,
  GenerateStageOutput,
} from '@/feed/engine/2-generate/generate.types';
import { walkSource } from '@/feed/engine/2-generate/walk.source';
import { Stage } from '@/feed/engine/engine.type';

/**
 * Stage 2 of the feed pipeline.
 *
 * The positive and negative walks remain independent signals. Popular titles
 * are a third source; the following merge step will combine equal title ids.
 */
const run = async (input: GenerateStageInput): Promise<GenerateStageOutput> => {
  const [positiveWalk, negativeWalk] = await Promise.all([
    walkSource({
      seeds: input.positiveSeeds,
      getNeighbours: input.getNeighbours,
    }),
    walkSource({
      seeds: input.negativeSeeds,
      getNeighbours: input.getNeighbours,
    }),
  ]);
  const popularCandidates = popularSource(input.popular);

  return {
    positiveWalk,
    negativeWalk,
    popularCandidates,
  };
};

export const generateStage: Stage<
  GenerateStageInput,
  Promise<GenerateStageOutput>
> = { run };
