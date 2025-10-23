import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { SesService } from './SES/ses.service';

@Module({
  providers: [
    {
      provide: EmailService,
      useClass: SesService,
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}
