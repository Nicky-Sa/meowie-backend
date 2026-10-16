import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import _shuffle from 'lodash/shuffle';
import { FeedResDto } from '@/feed/dto/feed.dto';
import { FEED_BATCH_SIZE } from '@/feed/constants/feed.constant';
import { FeedQueueService } from '@/feed/queue/queue.service';
import { FeedStorageService } from '@/feed/storage/storage.service';
import {
  DeliveredTitleIds,
  FeedStateRequest,
} from '@/feed/storage/storage.types';
import { ScoredTitle } from '@/feed/engine/scoring/scoring.types';
import { ClsService } from '@/common/cls/cls.service';
import { MediaType } from '@/types/media-type';

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    private readonly feedQueueService: FeedQueueService,
    private readonly storageService: FeedStorageService,
    private readonly cls: ClsService,
  ) {}

  async getFeed(
    userId: number | null,
    mediaType: MediaType,
  ): Promise<FeedResDto> {
    const request = this.getFeedStateRequest(userId, mediaType);
    const [feedState, deliveredTitleIds] = await Promise.all([
      this.storageService.readFeedState(request),
      this.storageService.readDeliveredTitleIds(request),
    ]);
    const undeliveredTitles = this.getUndeliveredTitles(
      feedState.allScoredTitles,
      deliveredTitleIds,
    );
    const sourcesExhausted = Object.values(feedState.sources).every(
      (source) => source?.status === 'exhausted',
    );

    if (
      this.isThisBatchReady(
        undeliveredTitles.length,
        deliveredTitleIds.length,
        sourcesExhausted,
      )
    ) {
      return this.deliverTitles(request, undeliveredTitles, deliveredTitleIds);
    }

    if (sourcesExhausted) return this.getFeedFromHistory(deliveredTitleIds);

    await this.prepareTitlesForFeed(request);
    return { results: [], status: 'preparing' };
  }

  async restartFeedPreparation(userId: number | null): Promise<void> {
    const requests = (['movie', 'series'] as const).map((mediaType) =>
      this.getFeedStateRequest(userId, mediaType),
    );
    await Promise.all(
      requests.map((request) => this.storageService.resetFeed(request)),
    );
    await Promise.all(
      requests.map((request) => this.prepareTitlesForFeed(request)),
    );
  }

  private getFeedStateRequest(
    userId: number | null,
    mediaType: MediaType,
  ): FeedStateRequest {
    if (userId !== null) return { type: 'account', userId, mediaType };

    const deviceCode = this.cls.deviceCode;
    if (!deviceCode || !isUUID(deviceCode)) {
      throw new BadRequestException('Device code must be a UUID');
    }

    return { type: 'guest', deviceCode, mediaType };
  }

  private getUndeliveredTitles(
    allScoredTitles: ScoredTitle[],
    deliveredTitleIds: DeliveredTitleIds,
  ): ScoredTitle[] {
    return allScoredTitles.filter(({ id }) => !deliveredTitleIds.includes(id));
  }

  private getFeedFromHistory(deliveredTitleIds: DeliveredTitleIds): FeedResDto {
    return {
      results: _shuffle(deliveredTitleIds).slice(0, FEED_BATCH_SIZE),
      status: 'ready',
    };
  }

  private isThisBatchReady(
    undeliveredTitleCount: number,
    deliveredTitleCount: number,
    sourcesExhausted: boolean,
  ): boolean {
    return (
      undeliveredTitleCount > 0 &&
      (deliveredTitleCount > 0 ||
        undeliveredTitleCount >= FEED_BATCH_SIZE ||
        sourcesExhausted)
    );
  }

  private async deliverTitles(
    request: FeedStateRequest,
    undeliveredTitles: ScoredTitle[],
    deliveredTitleIds: DeliveredTitleIds,
  ): Promise<FeedResDto> {
    const results = undeliveredTitles
      .slice(0, FEED_BATCH_SIZE)
      .map(({ id }) => id);
    await this.storageService.saveDeliveredTitleIds(request, [
      ...deliveredTitleIds,
      ...results,
    ]);
    await this.prepareTitlesForFeed(request, { throwOnFailure: false });
    return { results, status: 'ready' };
  }

  private async prepareTitlesForFeed(
    request: FeedStateRequest,
    { throwOnFailure = true }: { throwOnFailure?: boolean } = {},
  ): Promise<void> {
    try {
      await this.feedQueueService.queueFeedPreparation(request);
    } catch (error) {
      this.logger.error('Could not queue feed preparation.', error);
      if (throwOnFailure) {
        throw new ServiceUnavailableException(
          'Could not prepare your feed. Please try again.',
        );
      }
    }
  }
}
