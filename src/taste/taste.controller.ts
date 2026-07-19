import { Controller, Get, Put, Req, Body } from '@nestjs/common';
import { TasteService } from '@/taste/taste.service';
import { AuthenticatedRequest } from '@/auth/types/authenticated-request.type';
import { AccessGuard } from '@/auth/guards/access.guard';
import { SaveTasteReqDto, TasteResDto } from '@/taste/dto/save-taste.dto';
import { TasteJourneyResDto } from '@/taste/dto/journey.dto';
import { GenreRarityService } from '@/taste/genre-rarity.service';
import { MOVIES, SERIES } from '@/taste/constants/pools.constant';
import {
  AUTO_SELECT_THRESHOLD,
  AVOID_CHIPS,
  EXPLORE_LEVELS,
  GENRE_CHIPS,
  TASTE_QUESTIONS,
} from '@/taste/constants/journey.constant';

@Controller('taste')
export class TasteController {
  constructor(
    private readonly tasteService: TasteService,
    private readonly genreRarityService: GenreRarityService,
  ) {}

  // Wizard bootstrap: everything each step needs, fetched once on entry.
  @Get('journey')
  async getJourney(): Promise<TasteJourneyResDto> {
    return {
      movies: MOVIES,
      series: SERIES,
      genreChips: GENRE_CHIPS,
      questions: TASTE_QUESTIONS,
      avoidChips: [...AVOID_CHIPS],
      exploreLevels: EXPLORE_LEVELS,
      rarityWeights: await this.genreRarityService.getWeights(),
      autoSelectThreshold: AUTO_SELECT_THRESHOLD,
    };
  }

  @AccessGuard()
  @Put()
  async save(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SaveTasteReqDto,
  ): Promise<TasteResDto> {
    return this.tasteService.save(req.user.id, dto);
  }

  @AccessGuard()
  @Get()
  async get(@Req() req: AuthenticatedRequest): Promise<TasteResDto | null> {
    return this.tasteService.findByUserId(req.user.id);
  }
}
