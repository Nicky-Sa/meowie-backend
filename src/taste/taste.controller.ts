import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { TasteService } from '@/taste/taste.service';
import { OptionallyAuthenticatedRequest } from '@/auth/types/authenticated-request.type';
import { OptionalAccessGuard } from '@/auth/guards/optional-access.guard';
import {
  SubmitTasteReqDto,
  SubmitTasteResDto,
} from '@/taste/dto/submit-taste.dto';
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

  @OptionalAccessGuard()
  @Post()
  async submitTaste(
    @Req() req: OptionallyAuthenticatedRequest,
    @Body() dto: SubmitTasteReqDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SubmitTasteResDto> {
    const isNewTaste = await this.tasteService.submitTaste(req.user.id, dto);
    response.status(isNewTaste ? HttpStatus.CREATED : HttpStatus.NO_CONTENT);
    return { successful: isNewTaste };
  }
}
