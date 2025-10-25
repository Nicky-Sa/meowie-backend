import { IsEmail } from 'class-validator';

export class RequestOtpReqDto {
  @IsEmail()
  email: string;
}

export type RequestOtpResDto = {
  newUser: boolean;
};
