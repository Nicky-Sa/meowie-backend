import { Injectable } from '@nestjs/common';
import { CacheService } from '@/cache/cache.service';
import { FEED_EXPIRY_SECONDS } from '@/feed/constants/feed.constant';
import {
  FeedState,
  FeedStorageRequest,
  FeedStorageResult,
} from '@/feed/engine/storage/storage.types';

@Injectable()
export class FeedStorageService {
  constructor(private readonly cache: CacheService) {}

  async read(request: FeedStorageRequest): Promise<FeedStorageResult> {
    const state = await this.cache.get<FeedState>(this.getStateKey(request));
    const emptyState: FeedState = {
      sources: { recommendations: null, discover: null },
      processedTitleIds: [],
      waitingTitles: [],
      deliveredPages: {},
    };

    return state ?? emptyState;
  }

  async save(request: FeedStorageRequest, state: FeedState): Promise<void> {
    await this.cache.set(this.getStateKey(request), state, FEED_EXPIRY_SECONDS);
  }

  private getStateKey({ userId, mediaType }: FeedStorageRequest): string {
    return `feed-state-${userId}-${mediaType}`;
  }
}
