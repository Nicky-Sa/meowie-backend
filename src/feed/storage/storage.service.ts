import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsWhere,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { Feed } from '@/feed/entities/feed.entity';
import { FeedProcessedTitle } from '@/feed/entities/feed-processed-title.entity';
import { FEED_SOURCES } from '@/feed/engine/source/source.service';
import {
  FeedSource,
  StoredSourceProgress,
} from '@/feed/engine/source/source.types';
import {
  DeliveredTitleIds,
  FeedState,
  FeedStateRequest,
} from '@/feed/storage/storage.types';

export const getOwnerKey = (request: FeedStateRequest): string =>
  request.type === 'guest'
    ? `guest-${request.deviceCode}`
    : `account-${request.userId}`;

@Injectable()
export class FeedStorageService {
  constructor(
    @InjectRepository(Feed)
    private readonly feedRepository: Repository<Feed>,
    @Inject(FEED_SOURCES)
    private readonly sourceServices: readonly FeedSource[],
  ) {}

  async resetFeed(request: FeedStateRequest): Promise<void> {
    await this.feedRepository.manager.transaction(async (manager) => {
      const feed = await this.findOrCreateFeed(request, manager);
      await manager.delete(FeedProcessedTitle, { feedId: feed.id });
      await manager.update(Feed, feed.id, {
        inputId: () => 'DEFAULT',
        sources: this.createEmptySourceProgress(),
      });
    });
  }

  async readFeedState(request: FeedStateRequest): Promise<FeedState> {
    return this.feedRepository.manager.transaction(async (manager) => {
      const feed = await this.findOrCreateFeed(request, manager);
      const processedTitles = await manager.find(FeedProcessedTitle, {
        where: { feedId: feed.id },
        order: { position: 'ASC' },
      });

      return {
        inputId: feed.inputId,
        sources: feed.sources,
        processedTitleIds: processedTitles.map(({ tmdbId }) => tmdbId),
        scoredTitleIds: processedTitles
          .filter(({ position }) => position !== null)
          .map(({ tmdbId }) => tmdbId),
      };
    });
  }

  async saveFeedState(
    request: FeedStateRequest,
    state: FeedState,
  ): Promise<boolean> {
    return this.feedRepository.manager.transaction(async (manager) => {
      const feed = await manager.findOne(Feed, {
        where: this.getFeedOwnerWhereClause(request),
        lock: { mode: 'pessimistic_write' },
      });
      if (!feed || feed.inputId !== state.inputId) return false;

      const positions = new Map(
        state.scoredTitleIds.map((id, position) => [id, position]),
      );
      const processedTitles = state.processedTitleIds.map((tmdbId) => ({
        feedId: feed.id,
        tmdbId,
        position: positions.get(tmdbId) ?? null,
      }));

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

  async readDeliveredTitleIds(
    request: FeedStateRequest,
  ): Promise<DeliveredTitleIds> {
    const titles = await this.feedRepository.manager.find(FeedProcessedTitle, {
      select: { tmdbId: true },
      where: { feed: this.getFeedOwnerWhereClause(request), isDelivered: true },
    });
    return titles.map(({ tmdbId }) => tmdbId);
  }

  async saveDeliveredTitleIds(
    request: FeedStateRequest,
    toBeDeliveredTitleIds: DeliveredTitleIds,
  ): Promise<void> {
    await this.feedRepository.manager.transaction(async (manager) => {
      const feed = await manager.findOne(Feed, {
        where: this.getFeedOwnerWhereClause(request),
        lock: { mode: 'pessimistic_write' },
      });
      if (!feed) return;

      await manager.update(
        FeedProcessedTitle,
        {
          feedId: feed.id,
          tmdbId: In(toBeDeliveredTitleIds),
          position: Not(IsNull()),
        },
        { isDelivered: true },
      );
    });
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
