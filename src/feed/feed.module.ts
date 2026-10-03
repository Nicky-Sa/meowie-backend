import { Module } from '@nestjs/common';
import { FeedController } from '@/feed/feed.controller';
import { FeedService } from '@/feed/feed.service';
import { MovieModule } from '@/movie/movie.module';
import { SeriesModule } from '@/series/series.module';

@Module({
  imports: [MovieModule, SeriesModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
