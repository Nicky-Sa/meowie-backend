import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvService } from '@/env/env.service';
import {
  JwtAttachedToUser,
  JwtRefreshTokenPayload,
} from '@/auth/types/jwt.type';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly env: EnvService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: env.get('JWT_REFRESH_SECRET'),
    });
  }

  /**
   * This method is called after the refresh token is validated.
   * It receives the request and the payload.
   */
  validate(payload: JwtRefreshTokenPayload): JwtAttachedToUser {
    // This object will be attached to req.user
    return { id: payload.sub };
  }
}
