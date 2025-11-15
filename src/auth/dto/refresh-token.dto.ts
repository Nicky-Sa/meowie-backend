export type RefreshTokenReqDto = {
  refreshToken: string;
};

export type RefreshTokenResDto = {
  accessToken: string;
  refreshToken: string;
};
