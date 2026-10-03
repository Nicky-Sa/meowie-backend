import { CandidateDetails } from '@/feed/engine/candidate.types';

export type FilterRequest = {
  userId: number;
  candidates: readonly CandidateDetails[];
};

export type FilterResult = CandidateDetails[];
