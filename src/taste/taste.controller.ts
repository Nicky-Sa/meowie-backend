import { Controller, Get, Put, Req, Body } from '@nestjs/common';
import { TasteService } from '@/taste/taste.service';
import { AuthenticatedRequest } from '@/auth/types/authenticated-request.type';
import { AccessGuard } from '@/auth/guards/access.guard';
import { SaveTasteReqDto, TasteResDto } from '@/taste/dto/save-taste.dto';
import { TasteJourneyResDto } from '@/taste/dto/journey.dto';
import { toJourneyTitle } from '@/taste/utils/journey-title';
import { MOVIES, SERIES } from '@/taste/constants/pools.constant';
import {
  AVOID_CHIPS,
  EXPLORE_LEVELS,
  GENRE_IDS,
  TASTE_QUESTIONS,
} from '@/taste/constants/journey.constant';

@Controller('taste')
export class TasteController {
  constructor(private readonly tasteService: TasteService) {}

  @Get('journey')
  getJourney(): TasteJourneyResDto {
    return {
      movies: MOVIES.map(toJourneyTitle),
      series: SERIES.map(toJourneyTitle),
      genreIds: GENRE_IDS,
      questions: TASTE_QUESTIONS,
      avoidChips: AVOID_CHIPS,
      exploreLevels: EXPLORE_LEVELS,
    };
  }

  @AccessGuard()
  @Put()
  async saveTaste(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SaveTasteReqDto,
  ): Promise<TasteResDto> {
    return this.tasteService.save(req.user.id, dto);
  }

  @AccessGuard()
  @Get()
  async getMyTaste(
    @Req() req: AuthenticatedRequest,
  ): Promise<TasteResDto | null> {
    return this.tasteService.findByUserId(req.user.id);
  }
}
