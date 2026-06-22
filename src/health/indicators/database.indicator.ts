import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { DataSource } from 'typeorm';
import { BaseIndicator } from '@/health/indicators/base.indicator';

@Injectable()
export class DatabaseIndicator extends BaseIndicator {
  private readonly logger = new Logger(DatabaseIndicator.name);
  readonly key = 'database';

  constructor(
    private readonly dataSource: DataSource,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {
    super();
  }

  async isHealthy() {
    const indicator = this.healthIndicatorService.check(this.key);
    try {
      // Direct query check is more reliable and gives us better error visibility
      await this.dataSource.query('SELECT 1');
      return indicator.up();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Database health check failed: ${message}`, stack);
      return indicator.down({ message });
    }
  }
}
