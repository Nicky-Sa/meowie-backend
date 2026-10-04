import { Candidate } from '@/feed/engine/candidate.types';
import { MediaType } from '@/types/media-type';
import type { RecommendationsSourceService } from '@/feed/engine/source/recommendations/recommendations.service';

export type FeedSource = RecommendationsSourceService;

export type SourceRequest = {
  mediaType: MediaType;
  /** Null starts the source; subsequent values come from its previous batch. */
  cursor: string | null;
};

export type SourceResult = {
  candidates: Candidate[];
  next: { status: 'more'; cursor: string } | { status: 'exhausted' };
};
