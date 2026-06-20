import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { CollectionsSyncService } from '@/collections/collections-sync.service';
import {
  COLLECTIONS_SYNC_QUEUE,
  DEFAULT_WORKER_OPTIONS,
} from '@/common/queue.constants';

@Processor(COLLECTIONS_SYNC_QUEUE.name, DEFAULT_WORKER_OPTIONS)
export class CollectionsProcessor
  extends WorkerHost
  implements OnModuleDestroy
{
  private readonly logger = new Logger(CollectionsProcessor.name);

  constructor(private readonly collectionsSyncService: CollectionsSyncService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case COLLECTIONS_SYNC_QUEUE.jobs.syncAll:
        await Promise.all([
          this.collectionsSyncService.syncImdbTop250Movies(),
          this.collectionsSyncService.syncImdbTop250Series(),
          this.collectionsSyncService.syncLetterboxdTop250Narrative(),
          this.collectionsSyncService.syncLetterboxdTop250Documentaries(),
        ]);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Collections sync job ${job.id} failed`, err);
  }

  async onModuleDestroy() {
    this.logger.log('Pausing and shutting down collections sync worker...');
    await this.worker.pause();
    await this.worker.close();
  }
}
