import { SourceRequest } from '@/feed/engine/source/source.types';

export type RecommendationsRequest = SourceRequest & {
  titleIds: readonly number[];
};
