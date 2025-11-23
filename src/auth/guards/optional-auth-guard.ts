import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt-access') {
  handleRequest<TUser>(err: any, user: TUser): TUser | { id: null } {
    // If there is an error (e.g., invalid token) or no user,
    // return null instead of throwing 401.
    if (err || !user) {
      return { id: null };
    }
    return user;
  }
}
