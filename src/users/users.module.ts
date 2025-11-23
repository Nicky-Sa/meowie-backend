import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { ChurnLog } from './entities/churn-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ChurnLog])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
