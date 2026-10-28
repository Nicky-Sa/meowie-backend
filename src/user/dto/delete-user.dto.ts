import { IsEmail, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  CHURN_REASONS_IDS,
  ChurnReasonId,
} from '@/user/constants/churn-reasons.constant';
import { lowercaseEmail } from '@/auth/dto/auth.dto';

export class DeleteUserReqDto {
  @IsEmail()
  @Transform(lowercaseEmail)
  email: string;

  @IsIn(CHURN_REASONS_IDS, {
    message: `Reason must be one of: ${CHURN_REASONS_IDS.join(', ')}`,
  })
  churnReasonId: ChurnReasonId;
}

export class DeleteUserResDto {
  successful: boolean;
}
