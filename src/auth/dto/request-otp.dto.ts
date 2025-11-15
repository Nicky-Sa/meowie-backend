import { IsEmail } from 'class-validator';

export class RequestOtpReqDto {
  @IsEmail()
  email: string;
}
