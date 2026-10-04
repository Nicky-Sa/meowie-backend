import { InputRequest } from '@/feed/engine/input/input.types';
import { SourceResult } from '@/feed/engine/source/source.types';

export type OrchestratorRequest = InputRequest & {
  cursor: string | null;
};

export type OrchestratorResult = SourceResult;
