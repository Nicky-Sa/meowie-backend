import { Request } from 'express';

/**
 * Extends the default Express Request type to include
 * the `user` object, which is attached by Passport strategies.
 */
export type AuthenticatedRequest = Request & {
  user: {
    userId: number;
  };
};

export type AuthenticatedWithRefreshTokenRequest = Request & {
  user: {
    userId: number;
  };
  refreshToken: string; // Attached by RefreshTokenStrategy
};
