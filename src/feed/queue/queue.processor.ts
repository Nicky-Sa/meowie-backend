import { Logger, OnModuleDestroy } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DEFAULT_WORKER_OPTIONS, FEED_QUEUE } from '@/common/queue.constants';
import { OrchestratorService } from '@/feed/engine/orchestrator/orchestrator.service';
import { FeedQueueService } from '@/feed/queue/queue.service';
import { PrepareBatchJobData } from '@/feed/queue/queue.types';

@Processor(FEED_QUEUE.name, { ...DEFAULT_WORKER_OPTIONS, concurrency: 2 })
export class FeedProcessor extends WorkerHost implements OnModuleDestroy {
  private readonly logger = new Logger(FeedProcessor.name);

  constructor(
    private readonly orchestratorService: OrchestratorService,
    private readonly feedQueueService: FeedQueueService,
  ) {
    super();
  }

  async process(job: Job<PrepareBatchJobData>): Promise<void> {
    const { userId, mediaType } = job.data;

    switch (job.name) {
      case FEED_QUEUE.jobs.prepareBatch:
        await this.orchestratorService.run({ userId, mediaType });
        break;
      default:
        throw new Error('Unknown feed job.');
    }
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<PrepareBatchJobData>): Promise<void> {
    const { userId, mediaType, remainingBatches } = job.data;

    try {
      await this.feedQueueService.enqueueBatch(
        { userId, mediaType },
        remainingBatches - 1,
      );
    } catch {
      this.logger.error(
        `Could not continue feed preparation after job ${job.id}.`,
      );
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<PrepareBatchJobData> | undefined): void {
    this.logger.error(`Feed preparation job ${job?.id ?? 'unknown'} failed.`);
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Pausing and shutting down feed worker...');
    await this.worker.pause();
    await this.worker.close();
  }
}
