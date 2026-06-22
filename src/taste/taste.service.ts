import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Taste } from '@/taste/entities/taste.entity';
import { UpsertTasteReqDto, TasteResDto } from '@/taste/dto/upsert-taste.dto';
import { UserService } from '@/user/user.service';
import { DataSource } from 'typeorm';
import { TASTE_GENRES } from '@/taste/constants/taste-keywords.constant';
import { ResolvedTaste } from '@/taste/types/taste.type';
import { CacheService } from '@/cache/cache.service';
import { Cacheable } from '@/cache/cacheable.decorator';
import { Duration } from '@/common/app.constants';
import { MEDIA_TYPE_VALUES } from '@/types/media-type';

const resolvedTasteKey = (userId: number) => `taste-resolved-${userId}`;

@Injectable()
export class TasteService {
  constructor(
    @InjectRepository(Taste)
    private readonly tasteRepository: Repository<Taste>,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
  ) {}

  async upsert(userId: number, dto: UpsertTasteReqDto): Promise<TasteResDto> {
    await this.dataSource.transaction(async (manager) => {
      // 1. Upsert taste data
      await manager.upsert(
        Taste,
        {
          userId,
          keywords: dto.keywords,
          flexibility: dto.flexibility,
        },
        {
          conflictPaths: ['userId'],
        },
      );

      // 2. Mark user as having filled in taste
      await this.userService.update(userId, { hasFilledInTaste: true });
    });

    // Taste changed → drop the cached resolved form so the feed picks it up.
    await this.cacheService.del(resolvedTasteKey(userId));

    // Invalidate feed cache for all media types so the new taste takes immediate effect
    const keysToDelete: string[] = [];
    for (const mediaType of MEDIA_TYPE_VALUES) {
      const base = `feed:${userId}:${mediaType}`;
      keysToDelete.push(
        `${base}:pool`,
        `${base}:next-discover-page`,
        `${base}:shuffle-seed`,
        `${base}:served`,
      );
    }
    await Promise.all(keysToDelete.map((key) => this.cacheService.del(key)));

    return {
      keywords: dto.keywords,
      flexibility: dto.flexibility,
    };
  }

  async findByUserId(userId: number): Promise<TasteResDto | null> {
    const taste = await this.tasteRepository.findOneBy({ userId });

    if (!taste) {
      return null;
    }

    return {
      keywords: taste.keywords,
      flexibility: taste.flexibility,
    };
  }

  /**
   * Stored taste resolved into TMDB keyword + genre ids for the discovery layer.
   * Keywords are encoded `GenreName_TMDBKeywordId`; the genre ids come from
   * matching those genre names against TASTE_GENRES. Returns empty ids with
   * `normal` flexibility when the user has no taste yet.
   */
  @Cacheable({ key: resolvedTasteKey, ttl: Duration.ONE_DAY })
  async getResolvedTaste(userId: number): Promise<ResolvedTaste> {
    const taste = await this.findByUserId(userId);
    if (!taste) {
      return { keywordIds: [], genreIds: [], flexibility: 'normal' };
    }

    const keywordIds = [
      ...new Set(
        taste.keywords
          .map((keyword) => Number(keyword.slice(keyword.lastIndexOf('_') + 1)))
          .filter((id) => !Number.isNaN(id)),
      ),
    ];

    const genreNames = new Set(
      taste.keywords.map((keyword) =>
        keyword.slice(0, keyword.lastIndexOf('_')),
      ),
    );
    const genreIds = [...genreNames]
      .map((name) => TASTE_GENRES.find((genre) => genre.name === name)?.id)
      .filter((id): id is number => typeof id === 'number');

    return { keywordIds, genreIds, flexibility: taste.flexibility };
  }
}
