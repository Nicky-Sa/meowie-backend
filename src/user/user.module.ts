import { Module } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/entities/users.entity';
import { ChurnLog } from '@/user/entities/churn-log.entity';
import { UserController } from '@/user/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, ChurnLog])],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
