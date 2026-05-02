import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from './email.service';
import { Logger, Inject, OnModuleDestroy } from '@nestjs/common';
import { EMAIL_SENDER } from './email.constants';

type SendEmailJobData = {
  to: string;
  template: { name: string; data: Record<string, string> };
};

@Processor('email')
export class EmailProcessor extends WorkerHost implements OnModuleDestroy {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    @Inject(EMAIL_SENDER) private readonly realEmailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<SendEmailJobData>): Promise<void> {
    try {
      await this.realEmailService.sendEmail(job.data.to, job.data.template);
    } catch (error) {
      this.logger.error(`Failed to send email to ${job.data.to}:`, error);
      throw error; // Throwing will trigger BullMQ's retry mechanism
    }
  }

  async onModuleDestroy() {
    this.logger.log('Pausing and shutting down email worker...');
    await this.worker.pause();
    await this.worker.close();
  }
}
