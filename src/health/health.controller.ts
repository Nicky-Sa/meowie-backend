import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './indicators/database.health-indicator';
import { RedisHealthIndicator } from './indicators/redis.health-indicator';
import { EmailHealthIndicator } from './indicators/email.health-indicator';
import { TmdbHealthIndicator } from './indicators/tmdb.health-indicator';
import { AppService } from '../app.service';

@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: DatabaseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly email: EmailHealthIndicator,
    private readonly tmdb: TmdbHealthIndicator,
    private readonly appService: AppService,
  ) {}

  @Version(VERSION_NEUTRAL)
  @Get('health')
  @HealthCheck()
  async check() {
    const result = await this.health.check([
      () => this.db.isHealthy('database'),
      () => this.redis.isHealthy('redis'),
      () => this.email.isHealthy('email'),
      () => this.tmdb.isHealthy('tmdb'),
    ]);

    return {
      ...result,
      info: this.appService.getInfo(),
    };
  }
}
