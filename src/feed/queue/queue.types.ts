import { OrchestratorRequest } from '@/feed/engine/orchestrator/orchestrator.types';

export type PrepareBatchJobData = OrchestratorRequest & {
  remainingBatches: number;
};
