import { User } from '@/user/entities/users.entity';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestOtpReqDto {
  @IsEmail()
  email: string;
}

export class VerifyOtpReqDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  otp: string;
}

export class ThirdPartyAuthReqDto {
  @ApiProperty({
    description: 'The identity token obtained from Google or Apple native SDK',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class AuthResDto {
  isNewUser: boolean;

  accessToken: string;

  refreshToken: string;

  user: User;
}
