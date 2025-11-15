import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyOtpReqDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  otp: string;
}

export type VerifyOtpResDto = {
  isNewUser: boolean;
  accessToken: string;
  refreshToken: string;
};
