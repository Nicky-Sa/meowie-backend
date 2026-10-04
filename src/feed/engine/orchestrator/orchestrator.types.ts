import { InputRequest } from '@/feed/engine/input/input.types';
import {
  RecommendationsRequest,
  RecommendationsResult,
} from '@/feed/engine/source/recommendations/recommendations.types';
import {
  DiscoverRequest,
  DiscoverResult,
} from '@/feed/engine/source/discover/discover.types';

export type OrchestratorRequest = InputRequest & {
  cursors: {
    recommendations: RecommendationsRequest['cursor'];
    discover: DiscoverRequest['cursor'];
  };
};

export type OrchestratorResult = {
  recommendations: RecommendationsResult;
  discover: DiscoverResult;
};
