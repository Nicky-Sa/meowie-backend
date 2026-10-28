import { Injectable } from '@nestjs/common';
import { EnvService } from '@/env/env.service';
import { IdentityProvider } from '@/auth/identity-providers/identity-provider.service';
import appleSignin from 'apple-signin-auth';

@Injectable()
export class AppleIdentityProvider extends IdentityProvider {
  readonly displayName = 'Apple';

  constructor(private readonly env: EnvService) {
    super();
  }

  async verifyToken(token: string) {
    return appleSignin.verifyIdToken(token, {
      audience: this.env.get('APPLE_BUNDLE_ID'),
      ignoreExpiration: false,
    });
  }
}
