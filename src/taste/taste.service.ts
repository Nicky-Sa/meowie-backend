import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Taste } from '@/taste/entities/taste.entity';
import { SaveTasteReqDto } from '@/taste/dto/save-taste.dto';
import { CacheService } from '@/cache/cache.service';
import { Cacheable } from '@/cache/cacheable.decorator';
import { Duration } from '@/common/app.constants';
import { TasteForFeed } from '@/taste/types/taste.type';
import { isUniqueConstraintViolation } from '@/database/db-errors.util';

const accountTasteCacheKey = (userId: number) => `taste-account-${userId}`;
const guestTasteCacheKey = (deviceCode: string) => `taste-guest-${deviceCode}`;

@Injectable()
export class TasteService {
  constructor(
    @InjectRepository(Taste)
    private readonly tasteRepository: Repository<Taste>,
    private readonly cacheService: CacheService,
  ) {}

  async hasFilledIn(userId: number): Promise<boolean> {
    return this.tasteRepository.existsBy({ userId });
  }

  async saveAccountTaste(
    userId: number,
    dto: SaveTasteReqDto,
  ): Promise<boolean> {
    // The global pipe strips unknown fields, so the DTO holds columns only.
    try {
      await this.tasteRepository.insert({ userId, ...dto });
    } catch (error) {
      if (isUniqueConstraintViolation(error)) return false; // no overwrite for taste
      throw error;
    }

    await this.cacheService.del(accountTasteCacheKey(userId));
    return true;
  }

  @Cacheable({ key: accountTasteCacheKey, ttl: Duration.ONE_WEEK })
  async getAccountTasteForFeed(userId: number): Promise<TasteForFeed> {
    const taste = await this.tasteRepository.findOneBy({ userId });

    return {
      movieRatings: taste?.movieRatings ?? {},
      seriesRatings: taste?.seriesRatings ?? {},
      avoid: taste?.avoid ?? [],
    };
  }

  async saveGuestTaste(
    deviceCode: string,
    dto: SaveTasteReqDto,
  ): Promise<boolean> {
    return this.cacheService.set(
      guestTasteCacheKey(deviceCode),
      dto,
      Duration.ONE_YEAR,
      { onlyIfAbsent: true },
    );
  }

  async getGuestTasteForFeed(deviceCode: string): Promise<TasteForFeed> {
    const taste = await this.cacheService.get<TasteForFeed>(
      guestTasteCacheKey(deviceCode),
    );

    return taste ?? { movieRatings: {}, seriesRatings: {}, avoid: [] };
  }
}
