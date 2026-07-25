import { Module } from '@nestjs/common';
import { FeedController } from '@/feed/feed.controller';
import { FeedService } from '@/feed/feed.service';
import { TitleFinderService } from '@/feed/title-finder.service';
import { BatchBuilderService } from '@/feed/batch-builder.service';
import { TasteModule } from '@/taste/taste.module';
import { LibraryModule } from '@/library/library.module';
import { MovieModule } from '@/movie/movie.module';
import { SeriesModule } from '@/series/series.module';
import { TmdbModule } from '@/tmdb/tmdb.module';

@Module({
  imports: [TasteModule, LibraryModule, MovieModule, SeriesModule, TmdbModule],
  controllers: [FeedController],
  providers: [FeedService, TitleFinderService, BatchBuilderService],
})
export class FeedModule {}
