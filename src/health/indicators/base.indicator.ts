import { HealthIndicatorResult } from '@nestjs/terminus';

export abstract class BaseIndicator {
  abstract readonly key: string;
  abstract isHealthy(): Promise<HealthIndicatorResult>;
}
