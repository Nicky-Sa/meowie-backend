import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { COLLECTIONS_SYNC_QUEUE } from '@/common/queue.constants';

@Injectable()
export class CollectionsSyncQueueService {
  constructor(
    @InjectQueue(COLLECTIONS_SYNC_QUEUE.name)
    private readonly syncQueue: Queue,
  ) {}

  async enqueueSyncAll(): Promise<void> {
    await this.syncQueue.add(COLLECTIONS_SYNC_QUEUE.jobs.syncAll, {});
  }
}
