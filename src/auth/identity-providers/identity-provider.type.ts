export const identityProviderUserIdColumns = {
  apple: 'appleUserId',
  google: 'googleUserId',
} as const;

export type IdentityProviderName = keyof typeof identityProviderUserIdColumns;

export type IdentityProviderTokenPayload = {
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
};
