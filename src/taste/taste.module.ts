import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Taste } from '@/taste/entities/taste.entity';
import { TasteService } from '@/taste/taste.service';
import { TasteController } from '@/taste/taste.controller';
import { FeedModule } from '@/feed/feed.module';

@Module({
  imports: [TypeOrmModule.forFeature([Taste]), forwardRef(() => FeedModule)],
  controllers: [TasteController],
  providers: [TasteService],
  exports: [TasteService],
})
export class TasteModule {}
