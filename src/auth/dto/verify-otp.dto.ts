import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyOtpReqDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  otp: string;
}

export class VerifyOtpResDto {
  isValid: boolean;
}
