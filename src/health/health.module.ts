import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '@/health/health.controller';
import { RedisHealthIndicator } from '@/health/indicators/redis.health-indicator';
import { EmailHealthIndicator } from '@/health/indicators/email.health-indicator';
import { TmdbHealthIndicator } from '@/health/indicators/tmdb.health-indicator';
import { AppService } from '@/app.service';
import { EmailModule } from '@/email/email.module';
import { TmdbModule } from '@/tmdb/tmdb.module';
import { RatingsModule } from '@/ratings/ratings.module';
import { DatabaseHealthIndicator } from '@/health/indicators/database.health-indicator';

@Module({
  imports: [TerminusModule, EmailModule, TmdbModule, RatingsModule],
  controllers: [HealthController],
  providers: [
    RedisHealthIndicator,
    EmailHealthIndicator,
    TmdbHealthIndicator,
    DatabaseHealthIndicator,
    AppService,
  ],
})
export class HealthModule {}
