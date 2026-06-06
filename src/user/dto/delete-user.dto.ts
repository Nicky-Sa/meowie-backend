import { IsEmail, IsIn } from 'class-validator';
import {
  CHURN_REASONS_IDS,
  ChurnReasonId,
} from '@/constants/items/churn-reasons.constant';

export class DeleteUserReqDto {
  @IsEmail()
  email: string;

  @IsIn(CHURN_REASONS_IDS, {
    message: `Reason must be one of: ${CHURN_REASONS_IDS.join(', ')}`,
  })
  churnReasonId: ChurnReasonId;
}

export class DeleteUserResDto {
  successful: boolean;
}
