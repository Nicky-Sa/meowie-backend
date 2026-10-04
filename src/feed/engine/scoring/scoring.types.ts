import { Candidate } from '@/feed/engine/candidate.types';

export type ScoringRequest = {
  questions: readonly ScoringQuestion[];
};

export type ScoringQuestion = Candidate & {
  question: string;
};

export type CandidateScore = Candidate & {
  score: number;
};

export type ScoringResult = CandidateScore[];
