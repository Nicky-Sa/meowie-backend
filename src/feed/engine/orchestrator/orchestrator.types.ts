import { InputRequest } from '@/feed/engine/input/input.types';
import {
  RecommendationsRequest,
  RecommendationsResult,
} from '@/feed/engine/source/recommendations/recommendations.types';

export type OrchestratorRequest = InputRequest & {
  cursor: RecommendationsRequest['cursor'];
};

export type OrchestratorResult = RecommendationsResult;
