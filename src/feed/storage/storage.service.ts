import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
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

export const getOwnerKey = (request: FeedStateRequest): string =>
  request.type === 'guest'
    ? `guest-${request.deviceCode}`
    : `account-${request.userId}`;

const getDeliveryKey = (request: FeedStateRequest): string =>
  `feed-delivered-${getOwnerKey(request)}-${request.mediaType}`;

const getFeedStateKey = (request: FeedStateRequest): string =>
  `feed-state-${getOwnerKey(request)}-${request.mediaType}`;

@Injectable()
export class FeedStorageService {
  constructor(
    private readonly cache: CacheService,
    @Inject(FEED_SOURCES)
    private readonly sourceServices: readonly FeedSource[],
  ) {}

  async resetFeed(request: FeedStateRequest): Promise<void> {
    await Promise.all([
      this.cache.set(
        getFeedStateKey(request),
        this.createEmptyFeedState(),
        FEED_EXPIRY_SECONDS,
      ),
      this.cache.del(getDeliveryKey(request)),
    ]);
  }

  async readFeedState(request: FeedStateRequest): Promise<FeedState> {
    const key = getFeedStateKey(request);
    const state = await this.cache.get<FeedState>(key);
    if (state) return state;

    const emptyState = this.createEmptyFeedState();
    const createdEmptyState = await this.cache.set(
      key,
      emptyState,
      FEED_EXPIRY_SECONDS,
      {
        onlyIfAbsent: true,
      },
    );

    if (createdEmptyState) {
      await this.cache.del(getDeliveryKey(request)); // deleting the history when the feed state is fresh
      return emptyState;
    }

    // if created == false, it means something else has already stored this instance
    return this.readFeedState(request);
  }

  async saveFeedState(
    request: FeedStateRequest,
    state: FeedState,
  ): Promise<boolean> {
    return this.cache.setIfIdMatches(
      getFeedStateKey(request),
      state,
      FEED_EXPIRY_SECONDS,
      { field: 'inputId', expected: state.inputId },
    );
  }

  async readDeliveredTitleIds(
    request: FeedStateRequest,
  ): Promise<DeliveredTitleIds> {
    return (
      (await this.cache.get<DeliveredTitleIds>(getDeliveryKey(request))) ?? []
    );
  }

  async saveDeliveredTitleIds(
    request: FeedStateRequest,
    titleIds: DeliveredTitleIds,
  ): Promise<void> {
    await this.cache.set(
      getDeliveryKey(request),
      [...new Set(titleIds)],
      FEED_EXPIRY_SECONDS,
    );
  }

  private createEmptyFeedState(): FeedState {
    return {
      inputId: randomUUID(),
      sources: Object.fromEntries(
        this.sourceServices.map(({ name }) => [name, null]),
      ) as StoredSourceProgress,
      processedTitleIds: [],
      scoredTitleIds: [],
    };
  }
}
