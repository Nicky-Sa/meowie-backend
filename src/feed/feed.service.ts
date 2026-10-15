import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import _shuffle from 'lodash/shuffle';
import { CacheService } from '@/cache/cache.service';
import { MovieService } from '@/movie/movie.service';
import { SeriesService } from '@/series/series.service';
import { MediaType } from '@/types/media-type';
import { SortOption } from '@/common/types/media-query';
import { FeedResDto } from '@/feed/dto/feed.dto';
import { Cacheable } from '@/cache/cacheable.decorator';
import { Duration } from '@/common/app.constants';
import {
  FEED_BATCH_SIZE,
  MAX_GUEST_FEED_PAGE,
} from '@/feed/constants/feed.constant';
import { FeedQueueService } from '@/feed/queue/queue.service';
import { FeedStorageService } from '@/feed/storage/storage.service';
import {
  DeliveredTitleIds,
  FeedStateRequest,
} from '@/feed/storage/storage.types';
import { ScoredTitle } from '@/feed/engine/scoring/scoring.types';

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly movieService: MovieService,
    private readonly seriesService: SeriesService,
    private readonly feedQueueService: FeedQueueService,
    private readonly storageService: FeedStorageService,
  ) {}

  async getFeed(
    userId: number | null,
    mediaType: MediaType,
  ): Promise<FeedResDto> {
    if (userId === null) {
      const page = 1 + Math.floor(Math.random() * MAX_GUEST_FEED_PAGE);
      return this.getGuestFeed(mediaType, page);
    }

    return this.getUserFeed({ type: 'account', userId, mediaType });
  }

  private async getUserFeed(request: FeedStateRequest): Promise<FeedResDto> {
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

    await this.requestMoreTitles(request);
    return { results: [], status: 'preparing' };
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
    await this.requestMoreTitles(request, { throwOnFailure: false });
    return { results, status: 'ready' };
  }

  private async requestMoreTitles(
    request: FeedStateRequest,
    { throwOnFailure = true }: { throwOnFailure?: boolean } = {},
  ): Promise<void> {
    try {
      await this.feedQueueService.requestMoreTitles(request);
    } catch (error) {
      this.logger.error('Could not queue feed preparation.', error);
      if (throwOnFailure) {
        throw new ServiceUnavailableException(
          'Could not prepare your feed. Please try again.',
        );
      }
    }
  }

  @Cacheable({
    key: (mediaType: MediaType, page: number) =>
      `feed-guest-${mediaType}-p${page}-batch`,
    ttl: Duration.ONE_HOUR,
  })
  private async getGuestFeed(
    mediaType: MediaType,
    page: number,
  ): Promise<FeedResDto> {
    const query = { page, sort: SortOption.POPULARITY };
    const response =
      mediaType === 'movie'
        ? await this.movieService.getInterestingMovieIds(query)
        : await this.seriesService.getInterestingSeriesIds(query);

    return {
      results: response.results.slice(0, FEED_BATCH_SIZE),
      status: 'ready',
    };
  }
}
