import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { FEED_QUEUE } from '@/common/queue.constants';
import { OrchestratorRequest } from '@/feed/engine/orchestrator/orchestrator.types';
import {
  MAX_BATCHES_PER_REFILL,
  MIN_UNDELIVERED_TITLES,
} from '@/feed/constants/feed.constant';
import { PrepareBatchJobData } from '@/feed/queue/queue.types';
import {
  FeedStorageService,
  getOwnerKey,
} from '@/feed/storage/storage.service';

@Injectable()
export class FeedQueueService {
  constructor(
    @InjectQueue(FEED_QUEUE.name) private readonly feedQueue: Queue,
    private readonly storageService: FeedStorageService,
  ) {}

  async queueFeedPreparation(request: OrchestratorRequest): Promise<void> {
    const [feedState, deliveredTitleIds] = await Promise.all([
      this.storageService.readFeedState(request),
      this.storageService.readDeliveredTitleIds(request),
    ]);
    const undeliveredTitleIds = feedState.scoredTitleIds.filter(
      (id) => !deliveredTitleIds.includes(id),
    );

    if (undeliveredTitleIds.length >= MIN_UNDELIVERED_TITLES) return;

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

    const data: PrepareBatchJobData = { ...request, remainingBatches };

    await this.feedQueue.add(FEED_QUEUE.jobs.prepareBatch, data, {
      deduplication: {
        id: `feed-${getOwnerKey(request)}-${request.mediaType}`,
      },
    });
  }
}
