import { Inject, Injectable } from '@nestjs/common';
import { CacheService } from '@/cache/cache.service';
import { FEED_SOURCES } from '@/feed/engine/source/source.service';
import {
  FeedSource,
  StoredSourceProgress,
} from '@/feed/engine/source/source.types';
import { FEED_EXPIRY_SECONDS } from '@/feed/constants/feed.constant';
import {
  FeedState,
  FeedStorageRequest,
  FeedStorageResult,
} from '@/feed/storage/storage.types';

@Injectable()
export class FeedStorageService {
  constructor(
    private readonly cache: CacheService,
    @Inject(FEED_SOURCES)
    private readonly sourceServices: readonly FeedSource[],
  ) {}

  async read(request: FeedStorageRequest): Promise<FeedStorageResult> {
    const state = await this.cache.get<FeedState>(this.getStateKey(request));
    const emptyState: FeedState = {
      sources: Object.fromEntries(
        this.sourceServices.map(({ name }) => [name, null]),
      ) as StoredSourceProgress,
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
