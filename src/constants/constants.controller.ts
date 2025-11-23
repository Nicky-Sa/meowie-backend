import { Controller, Get } from '@nestjs/common';
import { CHURN_REASONS } from './items/churn-reasons.constant';
import { ChurnReasonsResDto } from './constants.dto';

@Controller('constants')
export class ConstantsController {
  constructor() {}

  @Get('churn-reasons')
  getChurnReasons(): ChurnReasonsResDto {
    return CHURN_REASONS;
  }
}
