import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { User } from '@/users/entities/users.entity';

export class VerifyOtpReqDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}

export class VerifyOtpResDto {
  isNewUser: boolean;

  accessToken: string;

  refreshToken: string;

  user: User;
}
