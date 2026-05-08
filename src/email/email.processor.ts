import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from './email.service';
import { Logger, Inject, OnModuleDestroy } from '@nestjs/common';
import { EMAIL_SENDER } from './email.constants';
import { EMAIL_QUEUE, DEFAULT_WORKER_OPTIONS } from '../common/queue.constants';

type SendEmailJobData = {
  to: string;
  template: { name: string; data: Record<string, string> };
};

@Processor(EMAIL_QUEUE.name, DEFAULT_WORKER_OPTIONS)
export class EmailProcessor extends WorkerHost implements OnModuleDestroy {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    @Inject(EMAIL_SENDER) private readonly realEmailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<SendEmailJobData>): Promise<void> {
    switch (job.name) {
      case EMAIL_QUEUE.jobs.sendEmail:
        await this.realEmailService.sendEmail(job.data.to, job.data.template);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
  @OnWorkerEvent('failed')
  onFailed(job: Job<SendEmailJobData>) {
    this.logger.error(`Failed to send email to ${job.data.to}`);
  }
  async onModuleDestroy() {
    this.logger.log('Pausing and shutting down email worker...');
    await this.worker.pause();
    await this.worker.close();
  }
}
