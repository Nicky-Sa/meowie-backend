import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { Feed } from '@/feed/entities/feed.entity';
import { FeedProcessedTitle } from '@/feed/entities/feed-processed-title.entity';
import { FEED_SOURCES } from '@/feed/engine/source/source.service';
import {
  FeedSource,
  SourceProgress,
  StoredSourceProgress,
} from '@/feed/engine/source/source.types';
import {
  FeedDelivery,
  FeedState,
  FeedStateRequest,
  FeedStateToSave,
} from '@/feed/storage/storage.types';
import { FEED_BATCH_SIZE } from '@/feed/constants/feed.constant';

export const getOwnerKey = (request: FeedStateRequest): string =>
  request.type === 'guest'
    ? `guest-${request.deviceCode}`
    : `account-${request.userId}`;

@Injectable()
export class FeedStorageService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(FeedProcessedTitle)
    private readonly feedProcessedTitleRepository: Repository<FeedProcessedTitle>,
    @Inject(FEED_SOURCES)
    private readonly sourceServices: readonly FeedSource[],
  ) {}

  async resetFeed(request: FeedStateRequest): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const feed = await this.findOrCreateFeed(request, manager);
      await manager.delete(FeedProcessedTitle, { feedId: feed.id });
      await manager.update(Feed, feed.id, {
        inputId: () => 'DEFAULT',
        sources: this.createEmptySourceProgress(),
      });
    });
  }

  async readFeedState(request: FeedStateRequest): Promise<FeedState> {
    return this.dataSource.transaction(async (manager) => {
      const feed = await this.findOrCreateFeed(request, manager);
      return {
        inputId: feed.inputId,
        sources: feed.sources,
      };
    });
  }

  async findProcessedTitleIds(
    request: FeedStateRequest,
    titleIds: number[],
  ): Promise<number[]> {
    const processedTitles = await this.feedProcessedTitleRepository.find({
      select: { tmdbId: true },
      where: {
        feed: this.getFeedOwnerWhereClause(request),
        tmdbId: In(titleIds),
      },
    });
    return processedTitles.map(({ tmdbId }) => tmdbId);
  }

  async saveFeedState(
    request: FeedStateRequest,
    state: FeedStateToSave,
  ): Promise<boolean> {
    return this.dataSource.transaction(async (manager) => {
      const feed = await manager.findOne(Feed, {
        where: this.getFeedOwnerWhereClause(request),
        lock: { mode: 'pessimistic_write' },
      });
      if (!feed || feed.inputId !== state.inputId) return false;

      const processedTitles = state.newProcessedTitles.map(
        ({ id: tmdbId, origins }) => ({
          feedId: feed.id,
          tmdbId,
          isAccepted: state.newAcceptedTitleIds.includes(tmdbId),
          origins,
        }),
      );

      // upsert FeedProcessedTitle table with processed values
      for (let start = 0; start < processedTitles.length; start += 1000) {
        await manager.upsert(
          FeedProcessedTitle,
          processedTitles.slice(start, start + 1000),
          ['feedId', 'tmdbId'],
        );
      }

      // update Feed table with the status of each source
      await manager.update(Feed, feed.id, { sources: state.sources });
      return true;
    });
  }

  async countUndeliveredTitles(request: FeedStateRequest): Promise<number> {
    return this.feedProcessedTitleRepository.countBy({
      feed: this.getFeedOwnerWhereClause(request),
      isAccepted: true,
      isDelivered: false,
    });
  }

  async deliverTitleIds(request: FeedStateRequest): Promise<FeedDelivery> {
    return this.dataSource.transaction(async (manager) => {
      const feed = await this.findOrCreateFeed(request, manager);
      const sourcesExhausted = this.areAllSourcesExhausted(feed.sources);
      const titleIdsToDeliver = await this.findRandomTitleIds(
        manager,
        feed.id,
        false,
      );

      if (this.isDeliveryReady(feed, titleIdsToDeliver.length)) {
        await this.markTitlesDelivered(manager, feed.id, titleIdsToDeliver);
        return {
          titleIds: titleIdsToDeliver,
          status: 'ready',
          sourcesExhausted,
        };
      }

      if (sourcesExhausted) {
        return {
          titleIds: await this.findRandomTitleIds(manager, feed.id, true),
          status: 'ready',
          sourcesExhausted,
        };
      }

      return { titleIds: [], status: 'preparing', sourcesExhausted };
    });
  }

  areAllSourcesExhausted(
    sources: StoredSourceProgress,
  ): sources is SourceProgress {
    return Object.values(sources).every(
      (source) => source?.status === 'exhausted',
    );
  }

  private isDeliveryReady(feed: Feed, titleCount: number): boolean {
    return (
      titleCount > 0 &&
      (titleCount >= FEED_BATCH_SIZE ||
        this.areAllSourcesExhausted(feed.sources))
    );
  }

  private async markTitlesDelivered(
    manager: EntityManager,
    feedId: number,
    titleIdsToDeliver: number[],
  ): Promise<void> {
    await manager.update(
      FeedProcessedTitle,
      { feedId, tmdbId: In(titleIdsToDeliver) },
      { isDelivered: true },
    );
  }

  private async findRandomTitleIds(
    manager: EntityManager,
    feedId: number,
    isDelivered: boolean,
    limit: number = FEED_BATCH_SIZE,
  ): Promise<number[]> {
    const titles = await manager
      .getRepository(FeedProcessedTitle)
      .createQueryBuilder('title')
      .select('title.tmdbId')
      .where({ feedId, isAccepted: true, isDelivered })
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();
    return titles.map(({ tmdbId }) => tmdbId);
  }

  private async findOrCreateFeed(
    request: FeedStateRequest,
    manager: EntityManager,
  ): Promise<Feed> {
    const where = this.getFeedOwnerWhereClause(request);
    const feed = await manager.findOne(Feed, {
      where,
      lock: { mode: 'pessimistic_write' },
    });
    if (feed) return feed;

    await manager
      .createQueryBuilder()
      .insert()
      .into(Feed)
      .values({
        userId: request.type === 'account' ? request.userId : null,
        deviceCode: request.type === 'guest' ? request.deviceCode : null,
        mediaType: request.mediaType,
        sources: this.createEmptySourceProgress(),
      })
      .orIgnore() // ignore inserting it if it failed as another job may have already created one
      .execute();

    return manager.findOneOrFail(Feed, {
      where,
      lock: { mode: 'pessimistic_write' }, // locking the row during this transaction
    });
  }

  private getFeedOwnerWhereClause(
    request: FeedStateRequest,
  ): FindOptionsWhere<Feed> {
    return request.type === 'guest'
      ? { deviceCode: request.deviceCode, mediaType: request.mediaType }
      : { userId: request.userId, mediaType: request.mediaType };
  }

  private createEmptySourceProgress(): StoredSourceProgress {
    return Object.fromEntries(
      this.sourceServices.map(({ name }) => [name, null]),
    ) as StoredSourceProgress;
  }
}
