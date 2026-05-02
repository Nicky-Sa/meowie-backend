import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './indicators/redis.health-indicator';
import { EmailHealthIndicator } from './indicators/email.health-indicator';
import { TmdbHealthIndicator } from './indicators/tmdb.health-indicator';
import { WhatsonHealthIndicator } from './indicators/whatson.health-indicator';
import { AppService } from '../app.service';
import { EmailModule } from '../email/email.module';
import { TmdbModule } from '../tmdb/tmdb.module';
import { RatingsModule } from '../ratings/ratings.module';

@Module({
  imports: [TerminusModule, EmailModule, TmdbModule, RatingsModule],
  controllers: [HealthController],
  providers: [
    RedisHealthIndicator,
    EmailHealthIndicator,
    TmdbHealthIndicator,
    WhatsonHealthIndicator,
    AppService,
  ],
})
export class HealthModule {}
