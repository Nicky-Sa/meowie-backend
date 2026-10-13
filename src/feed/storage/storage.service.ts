import { Inject, Injectable } from '@nestjs/common';
import { CacheService } from '@/cache/cache.service';
import { FEED_SOURCES } from '@/feed/engine/source/source.service';
import {
  FeedSource,
  StoredSourceProgress,
} from '@/feed/engine/source/source.types';
import { FEED_EXPIRY_SECONDS } from '@/feed/constants/feed.constant';
import {
  DeliveredTitleIds,
  FeedState,
  FeedStateRequest,
} from '@/feed/storage/storage.types';

@Injectable()
export class FeedStorageService {
  constructor(
    private readonly cache: CacheService,
    @Inject(FEED_SOURCES)
    private readonly sourceServices: readonly FeedSource[],
  ) {}

  async readFeedState(request: FeedStateRequest): Promise<FeedState> {
    const state = await this.cache.get<FeedState>(
      this.getPreparedFeedKey(request),
    );
    const emptyState: FeedState = {
      sources: Object.fromEntries(
        this.sourceServices.map(({ name }) => [name, null]),
      ) as StoredSourceProgress,
      processedTitleIds: [],
      allScoredTitles: [],
    };

    if (!state) return emptyState;

    return {
      sources: state.sources,
      processedTitleIds: state.processedTitleIds,
      allScoredTitles: state.allScoredTitles,
    };
  }

  async saveFeedState(
    request: FeedStateRequest,
    state: FeedState,
  ): Promise<void> {
    await this.cache.set(
      this.getPreparedFeedKey(request),
      { ...state },
      FEED_EXPIRY_SECONDS,
    );
  }

  async readDeliveredTitleIds(
    request: FeedStateRequest,
  ): Promise<DeliveredTitleIds> {
    return (
      (await this.cache.get<DeliveredTitleIds>(this.getDeliveryKey(request))) ??
      []
    );
  }

  async saveDeliveredTitleIds(
    request: FeedStateRequest,
    titleIds: DeliveredTitleIds,
  ): Promise<void> {
    await this.cache.set(
      this.getDeliveryKey(request),
      [...new Set(titleIds)],
      FEED_EXPIRY_SECONDS,
    );
  }

  private getDeliveryKey({ userId, mediaType }: FeedStateRequest): string {
    return `feed-delivered-${userId}-${mediaType}`;
  }

  private getPreparedFeedKey({ userId, mediaType }: FeedStateRequest): string {
    return `feed-state-${userId}-${mediaType}`;
  }
}
