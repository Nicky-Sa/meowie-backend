import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailService } from './email.service';
import { SesService } from './SES/ses.service';
import { EmailQueueService } from './email-queue.service';
import { EmailProcessor } from './email.processor';
import { EMAIL_SENDER } from './email.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [
    {
      provide: EMAIL_SENDER,
      useClass: SesService,
    },
    {
      provide: EmailService,
      useClass: EmailQueueService,
    },
    EmailProcessor,
  ],
  exports: [EmailService],
})
export class EmailModule {}
