export type JwtAccessTokenPayload = {
  sub: number;
  email: string;
};

export type JwtRefreshTokenPayload = {
  sub: number;
};
