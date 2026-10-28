import { Injectable } from '@nestjs/common';
import { EnvService } from '@/env/env.service';
import { IdentityProvider } from '@/auth/identity-providers/identity-provider.service';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleIdentityProvider extends IdentityProvider {
  readonly displayName = 'Google';
  private readonly googleClient = new OAuth2Client();

  constructor(private readonly env: EnvService) {
    super();
  }

  async verifyToken(token: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: token,
      audience: this.env.get('GOOGLE_CLIENT_ID'),
    });
    return ticket.getPayload();
  }
}
