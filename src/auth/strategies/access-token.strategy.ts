import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvService } from '../../env/env.service';
import { JwtAccessTokenPayload, JwtAttachedToUser } from '../types/jwt.type';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(private readonly env: EnvService) {
    super({
      // Strategy will extract the token from 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.get('JWT_SECRET'),
    });
  }

  /**
   * This method is called by passport after it successfully validates the token.
   * The returned value is then attached to the Request object as `req.user`.
   */
  validate(payload: JwtAccessTokenPayload): JwtAttachedToUser {
    // This object will be attached to req.user
    return { id: payload.sub };
  }
}
