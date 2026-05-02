import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './indicators/redis.health-indicator';
import { EmailHealthIndicator } from './indicators/email.health-indicator';
import { TmdbHealthIndicator } from './indicators/tmdb.health-indicator';
import { WhatsonHealthIndicator } from './indicators/whatson.health-indicator';
import { AppService } from '../app.service';

@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly email: EmailHealthIndicator,
    private readonly tmdb: TmdbHealthIndicator,
    private readonly whatson: WhatsonHealthIndicator,
    private readonly appService: AppService,
  ) {}

  @Version(VERSION_NEUTRAL)
  @Get('health')
  @HealthCheck()
  async check() {
    const result = await this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.isHealthy('redis'),
      () => this.email.isHealthy('email'),
      () => this.tmdb.isHealthy('tmdb'),
      () => this.whatson.isHealthy('whatson'),
    ]);

    return {
      ...result,
      info: this.appService.getInfo(),
    };
  }
}
