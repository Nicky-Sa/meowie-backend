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

export type ScoringQuestion = Title & {
  question: string;
  criteria: readonly string[];
};

export type CandidateScore = Title & {
  score: number;
};

export type ScoringResult = CandidateScore[];

export type ScoredCandidate = TitleWithDetail & Pick<CandidateScore, 'score'>;

export type ScoreSortingRequest = {
  candidates: TitleWithDetail[];
  scores: CandidateScore[];
};

export type ScoreSortingResult = ScoredCandidate[];
