import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from '@/health/health.controller';
import { RedisIndicator } from '@/health/indicators/redis.indicator';
import { EmailIndicator } from '@/health/indicators/email.indicator';
import { TmdbIndicator } from '@/health/indicators/tmdb.indicator';
import { AppService } from '@/app.service';
import { EmailModule } from '@/email/email.module';
import { TmdbModule } from '@/tmdb/tmdb.module';
import { RatingsModule } from '@/ratings/ratings.module';
import { DatabaseIndicator } from '@/health/indicators/database.indicator';
import { HEALTH_INDICATORS } from '@/health/health.constants';
import { BaseIndicator } from '@/health/indicators/base.indicator';

// a list of indicators that play a role in determining the health status
const indicators = [
  RedisIndicator,
  EmailIndicator,
  TmdbIndicator,
  DatabaseIndicator,
];

@Module({
  imports: [TerminusModule, EmailModule, TmdbModule, RatingsModule],
  controllers: [HealthController],
  providers: [
    ...indicators,
    {
      provide: HEALTH_INDICATORS,
      inject: [...indicators],
      useFactory: (...indicators: BaseIndicator[]) => [...indicators],
    },
    AppService,
  ],
})
export class HealthModule {}
