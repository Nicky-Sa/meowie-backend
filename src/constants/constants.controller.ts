import { Controller, Get } from '@nestjs/common';
import { CHURN_REASONS } from '@/constants/items/churn-reasons.constant';
import { TASTE_GENRES } from '@/constants/items/taste-keywords.constant';
import { FLEXIBILITY_OPTIONS } from '@/constants/items/flexibility-options.constant';
import {
  ChurnReasonsResDto,
  GenresResDto,
  TasteItemsResDto,
  FlexibilityOptionsResDto,
} from '@/constants/constants.dto';
import { ConstantsService } from '@/constants/constants.service';

@Controller('constants')
export class ConstantsController {
  constructor(private readonly constantsService: ConstantsService) {}

  @Get('churn-reasons')
  getChurnReasons(): ChurnReasonsResDto {
    return { reasons: CHURN_REASONS };
  }

  @Get('genres')
  async getGenres(): Promise<GenresResDto> {
    return this.constantsService.getGenres();
  }

  @Get('taste-items')
  getTasteItems(): TasteItemsResDto {
    return { tasteGenres: TASTE_GENRES };
  }

  @Get('flexibility-options')
  getFlexibilityOptions(): FlexibilityOptionsResDto {
    return { flexibilityOptions: FLEXIBILITY_OPTIONS };
  }
}
