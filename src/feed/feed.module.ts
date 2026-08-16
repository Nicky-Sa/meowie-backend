import { Module } from '@nestjs/common';
import { FeedController } from '@/feed/feed.controller';
import { FeedService } from '@/feed/feed.service';
import { MovieModule } from '@/movie/movie.module';
import { SeriesModule } from '@/series/series.module';
import { TmdbModule } from '@/tmdb/tmdb.module';

@Module({
  imports: [MovieModule, SeriesModule, TmdbModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
