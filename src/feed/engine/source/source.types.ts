import { Candidate } from '@/feed/engine/candidate.types';
import { MediaType } from '@/types/media-type';
import type { RecommendationsSourceService } from '@/feed/engine/source/recommendations/recommendations.service';

export type FeedSource = RecommendationsSourceService;

export type SourceRequest<TCursor> = {
  mediaType: MediaType;
  cursor: TCursor | null; // null starts the source; subsequent values come from its previous batch
};

export type SourceResult<TCursor> = {
  candidates: Candidate[];
  next: { status: 'more'; cursor: TCursor } | { status: 'exhausted' };
};
