import { InputRequest } from '@/feed/engine/input/input.types';
import { ScoredTitle } from '@/feed/engine/scoring/scoring.types';
import { RecommendationsResult } from '@/feed/engine/source/recommendations/recommendations.types';
import { DiscoverResult } from '@/feed/engine/source/discover/discover.types';

export type FeedState = {
  sources: {
    recommendations: RecommendationsResult['next'] | null;
    discover: DiscoverResult['next'] | null;
  };
  processedTitleIds: number[];
  waitingTitles: ScoredTitle[];
  deliveredPages: Record<number, number[]>;
};

export type FeedStorageRequest = InputRequest;

export type FeedStorageResult = FeedState;
