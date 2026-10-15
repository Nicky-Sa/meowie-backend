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

export const getOwnerKey = (request: FeedStateRequest): string =>
  request.type === 'guest'
    ? `guest-${request.deviceCode}`
    : `account-${request.userId}`;

const getDeliveryKey = (request: FeedStateRequest): string =>
  `feed-delivered-${getOwnerKey(request)}-${request.mediaType}`;

const getPreparedFeedKey = (request: FeedStateRequest): string =>
  `feed-state-${getOwnerKey(request)}-${request.mediaType}`;

@Injectable()
export class FeedStorageService {
  constructor(
    private readonly cache: CacheService,
    @Inject(FEED_SOURCES)
    private readonly sourceServices: readonly FeedSource[],
  ) {}

  async readFeedState(request: FeedStateRequest): Promise<FeedState> {
    const state = await this.cache.get<FeedState>(getPreparedFeedKey(request));
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
      getPreparedFeedKey(request),
      { ...state },
      FEED_EXPIRY_SECONDS,
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
}
