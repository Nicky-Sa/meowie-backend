import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { FeedResDto } from '@/feed/dto/feed.dto';
import { FeedQueueService } from '@/feed/queue/queue.service';
import { FeedStorageService } from '@/feed/storage/storage.service';
import { FeedStateRequest } from '@/feed/storage/storage.types';
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
    const delivery = await this.storageService.deliverTitleIds(request);

    if (!delivery.sourcesExhausted) {
      await this.prepareMoreTitlesForFeed(request, {
        throwOnFailure: delivery.status === 'preparing',
      });
    }

    return { results: delivery.titleIds, status: delivery.status };
  }

  async restartFeedPreparation(userId: number | null): Promise<void> {
    const requests = (['movie', 'series'] as const).map((mediaType) =>
      this.getFeedStateRequest(userId, mediaType),
    );
    await Promise.all(
      requests.map((request) => this.storageService.resetFeed(request)),
    );
    await Promise.all(
      requests.map((request) => this.prepareMoreTitlesForFeed(request)),
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

  private async prepareMoreTitlesForFeed(
    request: FeedStateRequest,
    { throwOnFailure = true }: { throwOnFailure?: boolean } = {},
  ): Promise<void> {
    try {
      await this.feedQueueService.queueFeedPreparationIfNeeded(request);
    } catch (error) {
      this.logger.error('Could not queue feed preparation', error);
      if (throwOnFailure) {
        throw new ServiceUnavailableException(
          'Could not prepare your feed. Please try again.',
        );
      }
    }
  }
}
