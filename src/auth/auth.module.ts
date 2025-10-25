import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [UsersModule, OtpModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
