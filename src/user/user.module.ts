import { Module } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/entities/users.entity';
import { ChurnLog } from '@/user/entities/churn-log.entity';
import { UserController } from '@/user/user.controller';
import { TasteModule } from '@/taste/taste.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, ChurnLog]), TasteModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
