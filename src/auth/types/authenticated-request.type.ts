import { Request } from 'express';

/**
 * Extends the default Express Request type to include
 * the `user` object, which is attached by Passport strategies.
 */
export type AuthenticatedRequest = Request & {
  user: {
    id: number;
  };
};

/**
 * Extends the default Express Request type to include
 * the `user` object, which is attached by Passport strategies and can be null
 */
export type OptionallyAuthenticatedRequest = Request & {
  user: {
    id: number | null;
  };
};
