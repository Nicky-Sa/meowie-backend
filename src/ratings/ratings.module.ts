import { Module } from '@nestjs/common';
import { RatingsService } from '@/ratings/ratings.service';

@Module({
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
