import { Seed } from '@/feed/engine/engine.type';
import {
  PopularSourceInput,
  PopularSourceOutput,
} from '@/feed/engine/2-generate/popular.types';
import {
  WalkSourceInput,
  WalkSourceOutput,
} from '@/feed/engine/2-generate/walk.types';

export type GenerateStageInput = {
  positiveSeeds: Seed[];
  negativeSeeds: Seed[];
  getNeighbours: WalkSourceInput['getNeighbours'];
  popular: PopularSourceInput;
};

export type GenerateStageOutput = {
  positiveWalk: WalkSourceOutput;
  negativeWalk: WalkSourceOutput;
  popularCandidates: PopularSourceOutput;
};
