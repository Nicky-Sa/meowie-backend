import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { CacheService } from '@/cache/cache.service';
import { BaseIndicator } from '@/health/indicators/base.indicator';

@Injectable()
export class RedisIndicator extends BaseIndicator {
  readonly key = 'redis';

  constructor(
    private readonly cacheService: CacheService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {
    super();
  }

  async isHealthy() {
    const indicator = this.healthIndicatorService.check(this.key);
    try {
      const result = await this.cacheService.ping();
      const isHealthy = result === 'PONG';

      if (isHealthy) {
        return indicator.up();
      }

      return indicator.down({ message: 'Redis PING failed' });
    } catch (error) {
      return indicator.down({
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
