import { Candidate, CandidateDetails } from '@/feed/engine/candidate.types';

export type ScoringRequest = {
  likedTitles: readonly CandidateDetails[];
  dislikedTitles: readonly CandidateDetails[];
  candidates: readonly CandidateDetails[];
};

export type CandidateScore = Candidate & {
  score: number;
};

export type ScoringResult = CandidateScore[];
