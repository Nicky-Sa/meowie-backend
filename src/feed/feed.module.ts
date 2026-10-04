import { Module } from '@nestjs/common';
import { FeedController } from '@/feed/feed.controller';
import { FeedService } from '@/feed/feed.service';
import { MovieModule } from '@/movie/movie.module';
import { SeriesModule } from '@/series/series.module';
import { TasteModule } from '@/taste/taste.module';
import { LibraryModule } from '@/library/library.module';
import { FEED_INPUTS } from '@/feed/engine/input/input.service';
import { FeedInput } from '@/feed/engine/input/input.types';
import { FEED_SOURCES } from '@/feed/engine/source/source.service';
import { FeedSource } from '@/feed/engine/source/source.types';
import { TmdbModule } from '@/tmdb/tmdb.module';
import { TasteInputService } from '@/feed/engine/input/taste/taste.service';
import { LibraryInputService } from '@/feed/engine/input/library/library.service';
import { RecommendationsSourceService } from '@/feed/engine/source/recommendations/recommendations.service';
import { OrchestratorService } from '@/feed/engine/orchestrator/orchestrator.service';
import { ProgressService } from '@/feed/engine/progress/progress.service';

const inputServices = [TasteInputService, LibraryInputService];
const sourceServices = [RecommendationsSourceService];

@Module({
  imports: [MovieModule, SeriesModule, TasteModule, LibraryModule, TmdbModule],
  controllers: [FeedController],
  providers: [
    FeedService,
    OrchestratorService,
    ProgressService,
    ...inputServices,
    {
      provide: FEED_INPUTS,
      useFactory: (...inputs: FeedInput[]) => inputs,
      inject: inputServices,
    },
    ...sourceServices,
    {
      provide: FEED_SOURCES,
      useFactory: (...sources: FeedSource[]) => sources,
      inject: sourceServices,
    },
  ],
})
export class FeedModule {}
