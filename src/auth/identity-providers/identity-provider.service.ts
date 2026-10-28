import { Injectable } from '@nestjs/common';
import { IdentityProviderTokenPayload } from '@/auth/identity-providers/identity-provider.type';

@Injectable()
export abstract class IdentityProvider {
  protected constructor() {}

  abstract displayName: string;
  abstract verifyToken(
    token: string,
  ): Promise<IdentityProviderTokenPayload | null | undefined>;
}
