import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { EnvService } from '@/env/env.service';

@Injectable()
export class CronGuard implements CanActivate {
  constructor(private readonly envService: EnvService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const cronSecret = request.headers['x-cron-secret'];

    if (cronSecret !== this.envService.get('CRON_SECRET')) {
      throw new UnauthorizedException('Invalid cron secret');
    }

    return true;
  }
}
