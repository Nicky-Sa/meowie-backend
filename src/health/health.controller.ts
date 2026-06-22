import {
  Controller,
  Get,
  Version,
  VERSION_NEUTRAL,
  Inject,
} from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { AppService } from '@/app.service';
import { HEALTH_INDICATORS } from '@/health/health.constants';
import { BaseIndicator } from '@/health/indicators/base.indicator';

@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    @Inject(HEALTH_INDICATORS)
    private readonly indicators: BaseIndicator[],
    private readonly appService: AppService,
  ) {}

  @Version(VERSION_NEUTRAL)
  @Get('health')
  @HealthCheck()
  async check() {
    const result = await this.health.check(
      this.indicators.map((indicator) => () => indicator.isHealthy()),
    );

    return {
      ...result,
      info: this.appService.getInfo(),
    };
  }
}
