import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { Taste } from '@/taste/entities/taste.entity';
import { SubmitTasteReqDto } from '@/taste/dto/submit-taste.dto';
import { CacheService } from '@/cache/cache.service';
import { Duration } from '@/common/app.constants';
import { TasteForFeed } from '@/taste/types/taste.type';
import { isUniqueConstraintViolation } from '@/database/db-errors.util';
import { ClsService } from '@/common/cls/cls.service';
import { FeedService } from '@/feed/feed.service';

const accountTasteCacheKey = (userId: number) => `taste-account-${userId}`;
const guestTasteCacheKey = (deviceCode: string) => `taste-guest-${deviceCode}`;

@Injectable()
export class TasteService {
  constructor(
    @InjectRepository(Taste)
    private readonly tasteRepository: Repository<Taste>,
    private readonly cacheService: CacheService,
    private readonly cls: ClsService,
    private readonly feedService: FeedService,
  ) {}

  async submitTaste(
    userId: number | null,
    dto: SubmitTasteReqDto,
  ): Promise<boolean> {
    let isNewTaste: boolean;
    if (userId !== null) {
      isNewTaste = await this.submitAccountTaste(userId, dto);
    } else {
      const deviceCode = this.cls.deviceCode;
      if (!deviceCode || !isUUID(deviceCode)) {
        throw new BadRequestException('x-device-code must be a UUID');
      }
      isNewTaste = await this.submitGuestTaste(deviceCode, dto);
    }

    if (isNewTaste) await this.feedService.restartFeedPreparation(userId);
    return isNewTaste;
  }

  async hasFilledIn(userId: number): Promise<boolean> {
    return this.tasteRepository.existsBy({ userId });
  }

  async submitAccountTaste(
    userId: number,
    dto: SubmitTasteReqDto,
  ): Promise<boolean> {
    // The global pipe strips unknown fields, so the DTO holds columns only.
    try {
      await this.tasteRepository.insert({ userId, ...dto });
      // write it to cache as well
      await this.cacheService.set(
        accountTasteCacheKey(userId),
        dto,
        Duration.ONE_WEEK,
      );
      return true;
    } catch (error) {
      if (isUniqueConstraintViolation(error)) return false; // no overwrite for taste
      throw error;
    }
  }

  async getAccountTasteForFeed(userId: number): Promise<TasteForFeed> {
    const cachedTaste = await this.cacheService.get<TasteForFeed>(
      accountTasteCacheKey(userId),
    );
    if (cachedTaste) return cachedTaste;

    const taste = await this.tasteRepository.findOneBy({ userId });

    return {
      movieRatings: taste?.movieRatings ?? {},
      seriesRatings: taste?.seriesRatings ?? {},
      avoid: taste?.avoid ?? [],
    };
  }

  async submitGuestTaste(
    deviceCode: string,
    dto: SubmitTasteReqDto,
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
