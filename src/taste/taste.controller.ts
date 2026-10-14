import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  Res,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { isUUID } from 'class-validator';
import { ClsService } from '@/common/cls/cls.service';
import { TasteService } from '@/taste/taste.service';
import { OptionallyAuthenticatedRequest } from '@/auth/types/authenticated-request.type';
import { OptionalAccessGuard } from '@/auth/guards/optional-access.guard';
import { SaveTasteReqDto, SaveTasteResDto } from '@/taste/dto/save-taste.dto';
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
  constructor(
    private readonly tasteService: TasteService,
    private readonly cls: ClsService,
  ) {}

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
  async saveTaste(
    @Req() req: OptionallyAuthenticatedRequest,
    @Body() dto: SaveTasteReqDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SaveTasteResDto> {
    let isNewTaste: boolean;
    if (req.user.id === null) {
      const deviceCode = this.cls.deviceCode;
      if (!deviceCode || !isUUID(deviceCode)) {
        throw new BadRequestException('x-device-code must be a UUID');
      }
      isNewTaste = await this.tasteService.saveGuestTaste(deviceCode, dto);
    } else {
      isNewTaste = await this.tasteService.saveAccountTaste(req.user.id, dto);
    }
    response.status(isNewTaste ? HttpStatus.CREATED : HttpStatus.NO_CONTENT);
    return { successful: isNewTaste };
  }
}
