import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { EnvService } from '../../env/env.service';
import { JwtRefreshTokenPayload } from '../types/jwt-payload.type';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly env: EnvService) {
    super({
      // Strategy will extract the token from 'Authorization: Refresh <token>'
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: env.get('JWT_REFRESH_SECRET'),
      // This is crucial: it passes the 'req' object to the 'validate' method
      passReqToCallback: true,
    });
  }

  /**
   * This method is called after the refresh token is validated.
   * It receives the request and the payload.
   */
  validate(req: Request, payload: JwtRefreshTokenPayload) {
    // Extract the original token from the body and attach it to the request
    const { refreshToken } = req.body as { refreshToken: string };
    req['refreshToken'] = refreshToken;

    // This object will be attached to req.user
    return {
      userId: payload.sub,
    };
  }
}
