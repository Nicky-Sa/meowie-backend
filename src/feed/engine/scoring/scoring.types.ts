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

export type ScoredTitle = TitleWithDetail & {
  score: number | null;
};

export type ScoringResult = ScoredTitle[];
