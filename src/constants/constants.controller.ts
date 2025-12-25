import { Controller, Get } from '@nestjs/common';
import { CHURN_REASONS } from './items/churn-reasons.constant';
import { ChurnReasonsResDto, GenresResDto } from './constants.dto';
import { GENRES } from './items/genres.constant';

@Controller('constants')
export class ConstantsController {
  constructor() {}

  @Get('churn-reasons')
  getChurnReasons(): ChurnReasonsResDto {
    return CHURN_REASONS;
  }

  @Get('genres')
  getGenres(): GenresResDto {
    return GENRES;
  }
}
