import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { FEED_QUEUE } from '@/common/queue.constants';
import { OrchestratorRequest } from '@/feed/engine/orchestrator/orchestrator.types';
import {
  MAX_BATCHES_PER_REFILL,
  MIN_WAITING_TITLES,
} from '@/feed/constants/feed.constant';
import { PrepareBatchJobData } from '@/feed/queue/queue.types';
import { FeedStorageService } from '@/feed/storage/storage.service';

@Injectable()
export class FeedQueueService {
  constructor(
    @InjectQueue(FEED_QUEUE.name) private readonly feedQueue: Queue,
    private readonly storageService: FeedStorageService,
  ) {}

  async replenish(request: OrchestratorRequest): Promise<void> {
    const state = await this.storageService.readFeedState(request);

    if (state.waitingTitles.length >= MIN_WAITING_TITLES) return;

    await this.enqueueBatch(request, MAX_BATCHES_PER_REFILL);
  }

  async enqueueBatch(
    request: OrchestratorRequest,
    remainingBatches: number,
  ): Promise<void> {
    if (remainingBatches <= 0) return;

    const state = await this.storageService.readFeedState(request);

    if (
      Object.values(state.sources).every(
        (source) => source?.status === 'exhausted',
      )
    ) {
      return;
    }

    const { userId, mediaType } = request;
    const data: PrepareBatchJobData = { ...request, remainingBatches };

    await this.feedQueue.add(FEED_QUEUE.jobs.prepareBatch, data, {
      deduplication: { id: `feed-${userId}-${mediaType}` },
    });
  }
}
