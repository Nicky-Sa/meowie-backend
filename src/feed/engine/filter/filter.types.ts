import { CandidateDetails } from '@/feed/engine/candidate.types';
import type { MarkedTitlesFilterService } from '@/feed/engine/filter/marked-titles/marked-titles.service';

export type FeedFilter = MarkedTitlesFilterService;

export type FilterRequest = {
  userId: number;
  candidates: readonly CandidateDetails[];
};

export type FilterResult = CandidateDetails[];
