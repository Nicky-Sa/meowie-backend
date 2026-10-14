import { Controller, Get, Put, Req, Body } from '@nestjs/common';
import { TasteService } from '@/taste/taste.service';
import { AuthenticatedRequest } from '@/auth/types/authenticated-request.type';
import { AccessGuard } from '@/auth/guards/access.guard';
import { SaveTasteReqDto } from '@/taste/dto/save-taste.dto';
import { TasteJourneyResDto } from '@/taste/dto/journey.dto';
import { toJourneyTitle } from '@/taste/utils/journey-title';
import { shuffledPool } from '@/taste/utils/shuffle-pool';
import { MOVIES, SERIES } from '@/taste/constants/pools.constant';
import {
  AVOID_CHIPS,
  MIN_MOVIES_TO_LIKE,
} from '@/taste/constants/journey.constant';

@Controller('taste')
export class TasteController {
  constructor(private readonly tasteService: TasteService) {}

  @Get('journey')
  getJourney(): TasteJourneyResDto {
    return {
      movies: shuffledPool(MOVIES).map(toJourneyTitle),
      series: shuffledPool(SERIES).map(toJourneyTitle),
      avoidChips: AVOID_CHIPS,
      minMoviesToLike: MIN_MOVIES_TO_LIKE,
    };
  }

  @AccessGuard()
  @Put()
  async saveTaste(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SaveTasteReqDto,
  ): Promise<void> {
    return this.tasteService.save(req.user.id, dto);
  }
}
