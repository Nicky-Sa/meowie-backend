import { Candidate, CandidateDetails } from '@/feed/engine/candidate.types';

export type ScoringRequest = {
  titlesWithContext: TitleWithContext[];
  candidates: CandidateDetails[];
};

export type TitleWithContext = Candidate & {
  details: CandidateDetails | null;
  context: {
    description: string;
  }[];
};

export type ScoringQuestion = Candidate & {
  question: string;
  criteria: readonly string[];
};

export type CandidateScore = Candidate & {
  score: number;
};

export type ScoringResult = CandidateScore[];

export type ScoredCandidate = CandidateDetails & Pick<CandidateScore, 'score'>;

export type ScoreSortingRequest = {
  candidates: CandidateDetails[];
  scores: CandidateScore[];
};

export type ScoreSortingResult = ScoredCandidate[];
