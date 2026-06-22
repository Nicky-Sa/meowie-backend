import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { EmailService } from '@/email/email.service';
import { BaseIndicator } from '@/health/indicators/base.indicator';

@Injectable()
export class EmailIndicator extends BaseIndicator {
  readonly key = 'email';

  constructor(
    private readonly emailService: EmailService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {
    super();
  }

  async isHealthy() {
    const indicator = this.healthIndicatorService.check(this.key);
    try {
      await this.emailService.ping();
      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
