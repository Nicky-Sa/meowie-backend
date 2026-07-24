import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Taste } from '@/taste/entities/taste.entity';
import { SaveTasteReqDto, TasteResDto } from '@/taste/dto/save-taste.dto';
import { UserService } from '@/user/user.service';
import { CacheService } from '@/cache/cache.service';
import { Cacheable } from '@/cache/cacheable.decorator';
import { Duration } from '@/common/app.constants';
import { MEDIA_TYPE_VALUES } from '@/types/media-type';
import { personalityFor } from '@/taste/personality';
import { GenreRarityService } from '@/taste/genre-rarity.service';
import { TasteForFeed } from '@/taste/types/taste.type';
import { DEFAULT_EXPLORE_LEVEL } from '@/taste/constants/journey.constant';

type TasteProfile = Omit<TasteResDto, 'personality'>;

const tasteForFeedCacheKey = (userId: number) => `taste-for-feed-${userId}`;

@Injectable()
export class TasteService {
  constructor(
    @InjectRepository(Taste)
    private readonly tasteRepository: Repository<Taste>,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
    private readonly cacheService: CacheService,
    private readonly genreRarityService: GenreRarityService,
  ) {}

  async save(userId: number, dto: SaveTasteReqDto): Promise<TasteResDto> {
    await this.dataSource.transaction(async (manager) => {
      await manager.upsert(
        Taste,
        {
          userId,
          movieIds: dto.movieIds,
          seriesIds: dto.seriesIds,
          seriesSkipped: dto.seriesSkipped,
          genreIds: dto.genreIds,
          era: dto.era,
          reality: dto.reality,
          tasteAuthority: dto.tasteAuthority,
          commitment: dto.commitment,
          avoid: dto.avoid,
          exploreLevel: dto.exploreLevel,
        },
        {
          conflictPaths: ['userId'],
        },
      );

      await this.userService.update(userId, { hasFilledInTaste: true });
    });

    // Taste changed → drop the cached feed copy so the feed picks it up.
    await this.cacheService.del(tasteForFeedCacheKey(userId));

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

    return this.toResDto(dto);
  }

  async findByUserId(userId: number): Promise<TasteResDto | null> {
    const taste = await this.tasteRepository.findOneBy({ userId });

    if (!taste) {
      return null;
    }

    return this.toResDto(taste);
  }

  /**
   * Stored taste reduced to what the feed personalizes on, with neutral
   * defaults when the user has no taste yet.
   */
  @Cacheable({ key: tasteForFeedCacheKey, ttl: Duration.ONE_DAY })
  async getTasteForFeed(userId: number): Promise<TasteForFeed> {
    const taste = await this.tasteRepository.findOneBy({ userId });

    if (!taste) {
      return {
        hasTaste: false,
        genreIds: [],
        movieIds: [],
        seriesIds: [],
        avoid: [],
        exploreLevel: DEFAULT_EXPLORE_LEVEL,
        era: null,
        reality: null,
        tasteAuthority: null,
        commitment: null,
      };
    }

    return {
      hasTaste: true,
      genreIds: taste.genreIds,
      movieIds: taste.movieIds,
      seriesIds: taste.seriesIds,
      avoid: taste.avoid,
      exploreLevel: taste.exploreLevel,
      era: taste.era,
      reality: taste.reality,
      tasteAuthority: taste.tasteAuthority,
      commitment: taste.commitment,
    };
  }

  private async toResDto(profile: TasteProfile): Promise<TasteResDto> {
    return {
      movieIds: profile.movieIds,
      seriesIds: profile.seriesIds,
      seriesSkipped: profile.seriesSkipped,
      genreIds: profile.genreIds,
      era: profile.era,
      reality: profile.reality,
      tasteAuthority: profile.tasteAuthority,
      commitment: profile.commitment,
      avoid: profile.avoid,
      exploreLevel: profile.exploreLevel,
      personality: personalityFor(
        profile,
        await this.genreRarityService.getWeights(),
      ),
    };
  }
}
