import { CandidateDetails } from '@/feed/engine/candidate.types';
import type { MarkedTitlesFilterService } from '@/feed/engine/filter/marked-titles/marked-titles.service';
import type { AvoidFilterService } from '@/feed/engine/filter/avoid/avoid.service';

export type FeedFilter = MarkedTitlesFilterService | AvoidFilterService;

export type FilterRequest = {
  userId: number;
  candidates: readonly CandidateDetails[];
};

export type FilterResult = CandidateDetails[];
