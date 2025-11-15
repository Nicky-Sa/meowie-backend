import { IsNotEmpty } from 'class-validator';

export class RefreshTokenReqDto {
  @IsNotEmpty()
  refreshToken: string;
}

export type RefreshTokenResDto = {
  accessToken: string;
  refreshToken: string;
};
