import { Candidate } from '@/feed/engine/candidate.types';
import { MediaType } from '@/types/media-type';
import type { RecommendationsSourceService } from '@/feed/engine/source/recommendations/recommendations.service';
import type { DiscoverSourceService } from '@/feed/engine/source/discover/discover.service';

export type FeedSource = RecommendationsSourceService | DiscoverSourceService;

export type SourceRequest<TCursor> = {
  mediaType: MediaType;
  cursor: TCursor | null; // null starts the source; subsequent values come from its previous batch
};

export type SourceResult<TCursor> = {
  candidates: Candidate[];
  next: { status: 'more'; cursor: TCursor } | { status: 'exhausted' };
};
