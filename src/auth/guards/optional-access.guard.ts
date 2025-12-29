import {
  applyDecorators,
  Injectable,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@Injectable()
class OptionalAuthGuard extends PassportAuthGuard('jwt-access') {
  handleRequest<TUser>(
    err: any,
    user: TUser,
    info?: { message?: string },
  ): TUser | { id: null } {
    const tokenProvided =
      info && info.message && info.message !== 'No auth token';
    if (tokenProvided) {
      throw new UnauthorizedException('Unauthorized');
    }
    // If there is an error (e.g., invalid token) or no user because no token was provided,
    // return null instead of throwing 401.
    if (err || !user) {
      return { id: null };
    }
    return user;
  }
}

export const OptionalAccessGuard = () => {
  return applyDecorators(
    UseGuards(OptionalAuthGuard),
    ApiBearerAuth('jwt-access-docs'),
  );
};
