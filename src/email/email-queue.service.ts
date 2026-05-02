import { Injectable, Inject } from '@nestjs/common';
import { EmailService } from './email.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { EmailTemplateConfig } from './email.types';
import { EMAIL_SENDER } from './email.constants';

@Injectable()
export class EmailQueueService extends EmailService {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    @Inject(EMAIL_SENDER) private readonly emailService: EmailService,
  ) {
    super();
  }

  async sendEmail(
    to: string,
    template: { name: string; data: Record<string, string> },
  ): Promise<void> {
    // Push the email job to the Redis queue instead of waiting for the email provider
    await this.emailQueue.add(
      'send-email',
      { to, template },
      {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  }

  async syncTemplates(config: EmailTemplateConfig): Promise<void> {
    return this.emailService.syncTemplates(config);
  }

  async ping(): Promise<void> {
    return this.emailService.ping();
  }
}
