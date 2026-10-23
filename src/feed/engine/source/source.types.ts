import { Title } from '@/feed/engine/engine.types';
import { MediaType } from '@/types/media-type';
import type { RecommendationsSourceService } from '@/feed/engine/source/recommendations/recommendations.service';
import type { DiscoverSourceService } from '@/feed/engine/source/discover/discover.service';

export type FeedSource = RecommendationsSourceService | DiscoverSourceService;

export type SourceData = {
  [source in FeedSource as source['name']]: Awaited<
    ReturnType<source['fetch']>
  >;
};

export type SourceProgress = {
  [source in keyof SourceData]: SourceData[source]['next'];
};

// the source can be initially null in the storage
export type StoredSourceProgress = {
  [source in keyof SourceProgress]: SourceProgress[source] | null;
};

export type SourceRequest<TCursor> = {
  mediaType: MediaType;
  cursor: TCursor | null; // null starts the source; subsequent values come from its previous batch
};

// why a source suggested a title, kept so a feed title can be traced back
export type TitleOrigin = {
  source: FeedSource['name'];
  titleId?: number;
};

export type Candidate = Title & {
  origins: TitleOrigin[];
};

export type SourceResult<TCursor> = {
  candidates: Candidate[];
  next: { status: 'more'; cursor: TCursor } | { status: 'exhausted' };
};
