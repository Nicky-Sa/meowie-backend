import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { CacheModule } from '../cache/cache.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [CacheModule, EmailModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
