import { InputRequest } from '@/feed/engine/input/input.types';
import { ScoredTitle } from '@/feed/engine/scoring/scoring.types';
import { SourceProgress } from '@/feed/engine/source/source.types';

export type OrchestratorRequest = InputRequest;

export type OrchestratorResult = {
  scoredTitles: ScoredTitle[];
  next: SourceProgress;
};
