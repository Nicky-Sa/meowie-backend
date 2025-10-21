import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), OtpModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
