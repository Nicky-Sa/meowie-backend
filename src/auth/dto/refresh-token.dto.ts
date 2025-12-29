import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenReqDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class RefreshTokenResDto {
  accessToken: string;

  refreshToken: string;
}
