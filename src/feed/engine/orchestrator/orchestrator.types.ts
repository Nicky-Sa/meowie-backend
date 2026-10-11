import { InputRequest } from '@/feed/engine/input/input.types';
import { ScoredTitle } from '@/feed/engine/scoring/scoring.types';
import { RecommendationsResult } from '@/feed/engine/source/recommendations/recommendations.types';
import { DiscoverResult } from '@/feed/engine/source/discover/discover.types';

export type OrchestratorRequest = InputRequest;

export type SourceData = {
  recommendations: RecommendationsResult;
  discover: DiscoverResult;
};

export type OrchestratorResult = {
  scoredTitles: ScoredTitle[];
  next: {
    [source in keyof SourceData]: SourceData[source]['next'];
  };
};
