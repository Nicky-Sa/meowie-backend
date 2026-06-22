import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { TmdbService } from '@/tmdb/tmdb.service';
import { BaseIndicator } from '@/health/indicators/base.indicator';

@Injectable()
export class TmdbIndicator extends BaseIndicator {
  readonly key = 'tmdb';

  constructor(
    private readonly tmdbService: TmdbService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {
    super();
  }

  async isHealthy() {
    const indicator = this.healthIndicatorService.check(this.key);
    try {
      await this.tmdbService.ping();
      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
