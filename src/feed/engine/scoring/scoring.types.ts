import { Title } from '@/feed/engine/engine.types';
import { TitleWithDetail } from '@/feed/engine/details/details.types';

export type ScoringRequest = {
  titlesWithContext: TitleWithContext[];
  candidates: TitleWithDetail[];
};

export type TitleWithContext = Title & {
  details: TitleWithDetail | null;
  context: {
    description: string;
  }[];
};

export type ScoringInstructions = Title & {
  instructions: string;
  criteria: readonly string[];
};

export type ScoredTitle = TitleWithDetail & {
  score: number;
};

export type ScoringResult = ScoredTitle[];
