import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { EmailModule } from '../email/email.module';
import { Otp } from './entities/otp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Otp]), EmailModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
