import { Module } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/users/entities/users.entity';
import { ChurnLog } from '@/users/entities/churn-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ChurnLog])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
