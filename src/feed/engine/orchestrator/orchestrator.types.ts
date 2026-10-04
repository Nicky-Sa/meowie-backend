import { InputRequest } from '@/feed/engine/input/input.types';
import { CandidateDetails } from '@/feed/engine/candidate.types';
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

export type SourceResults = {
  recommendations: RecommendationsResult;
  discover: DiscoverResult;
};

export type OrchestratorResult = {
  candidates: CandidateDetails[];
  next: {
    recommendations: RecommendationsResult['next'];
    discover: DiscoverResult['next'];
  };
};
