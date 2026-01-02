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
    // If the token is provided, but it's invalid, return 401 to trigger refresh
    const tokenProvided =
      info && info.message && info.message !== 'No auth token';
    if (tokenProvided) {
      throw new UnauthorizedException('Unauthorized');
    }
    // if no token is provided, return null (guest user)
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
