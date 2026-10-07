import { Candidate, CandidateDetails } from '@/feed/engine/candidate.types';

export type NullableCandidateDetails = CandidateDetails | null;

export type DetailsBatchRequest = Candidate[];

export type DetailsBatchResult = CandidateDetails[];
