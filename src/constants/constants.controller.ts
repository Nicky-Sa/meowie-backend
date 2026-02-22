import { Controller, Get } from '@nestjs/common';
import { CHURN_REASONS } from './items/churn-reasons.constant';
import { ChurnReasonsResDto, GenresResDto } from './constants.dto';
import { ConstantsService } from './constants.service';

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
}
