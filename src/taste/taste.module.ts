import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Taste } from '@/taste/entities/taste.entity';
import { TasteService } from '@/taste/taste.service';
import { TasteController } from '@/taste/taste.controller';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Taste]), UserModule],
  controllers: [TasteController],
  providers: [TasteService],
  exports: [TasteService],
})
export class TasteModule {}
