import { Module } from '@nestjs/common';
import { OtpService } from '@/otp/otp.service';
import { EmailModule } from '@/email/email.module';
import { CacheModule } from '@/cache/cache.module';

@Module({
  imports: [CacheModule, EmailModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
