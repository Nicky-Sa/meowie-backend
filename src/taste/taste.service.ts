import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Taste } from '@/taste/entities/taste.entity';
import { SaveTasteReqDto, TasteResDto } from '@/taste/dto/save-taste.dto';
import { CacheService } from '@/cache/cache.service';
import { feedCacheKeys } from '@/feed/engine/constants/feed.constant';
import { Cacheable } from '@/cache/cacheable.decorator';
import { Duration } from '@/common/app.constants';
import { MEDIA_TYPE_VALUES } from '@/types/media-type';
import { personalityFor } from '@/taste/utils/personality';
import { TasteForFeed } from '@/taste/types/taste.type';
import {
  BOTH,
  DEFAULT_EXPLORE_LEVEL,
} from '@/taste/constants/journey.constant';

const tasteForFeedCacheKey = (userId: number) => `taste-for-feed-${userId}`;

@Injectable()
export class TasteService {
  constructor(
    @InjectRepository(Taste)
    private readonly tasteRepository: Repository<Taste>,
    private readonly cacheService: CacheService,
  ) {}

  async save(userId: number, dto: SaveTasteReqDto): Promise<TasteResDto> {
    // The global pipe strips unknown fields, so the DTO holds columns only.
    await this.tasteRepository.upsert(
      { userId, ...dto },
      { conflictPaths: ['userId'] },
    );

    const staleKeys = [
      tasteForFeedCacheKey(userId),
      ...MEDIA_TYPE_VALUES.flatMap((mediaType) =>
        Object.values(feedCacheKeys(userId, mediaType)),
      ),
    ];
    await Promise.all(staleKeys.map((key) => this.cacheService.del(key)));

    return { personality: personalityFor(dto) };
  }

  async hasFilledIn(userId: number): Promise<boolean> {
    return this.tasteRepository.existsBy({ userId });
  }

  async findByUserId(userId: number): Promise<TasteResDto | null> {
    const taste = await this.tasteRepository.findOneBy({ userId });

    if (!taste) {
      return null;
    }

    return { personality: personalityFor(taste) };
  }

  /**
   * Stored taste reduced to what the feed personalizes on. A user with no
   * taste yet reads as "no preference" everywhere.
   */
  @Cacheable({ key: tasteForFeedCacheKey, ttl: Duration.ONE_DAY })
  async getTasteForFeed(userId: number): Promise<TasteForFeed> {
    const taste = await this.tasteRepository.findOneBy({ userId });

    return {
      movieRatings: taste?.movieRatings ?? {},
      seriesRatings: taste?.seriesRatings ?? {},
      avoid: taste?.avoid ?? [],
      exploreLevel: taste?.exploreLevel ?? DEFAULT_EXPLORE_LEVEL,
      era: taste?.era ?? BOTH,
      authority: taste?.authority ?? BOTH,
    };
  }
}
