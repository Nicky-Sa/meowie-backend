import { IsEmail } from 'class-validator';

// TODO: check if there is any other way than defining a class
export class RequestOtpReqDto {
  @IsEmail()
  email: string;
}

export type RequestOtpResDto = {
  newUser: boolean;
};
