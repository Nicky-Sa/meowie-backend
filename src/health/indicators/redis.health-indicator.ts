import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { CacheService } from '@/cache/cache.service';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly cacheService: CacheService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);
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
