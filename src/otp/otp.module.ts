import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
