import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { FEED_QUEUE } from '@/common/queue.constants';
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
import { FEED_FILTERS } from '@/feed/engine/filter/filter.service';
import { FeedFilter } from '@/feed/engine/filter/filter.types';
import { TmdbModule } from '@/tmdb/tmdb.module';
import { TasteInputService } from '@/feed/engine/input/taste/taste.service';
import { LibraryInputService } from '@/feed/engine/input/library/library.service';
import { RecommendationsSourceService } from '@/feed/engine/source/recommendations/recommendations.service';
import { DiscoverSourceService } from '@/feed/engine/source/discover/discover.service';
import { ProgressService } from '@/feed/engine/progress/progress.service';
import { DetailsService } from '@/feed/engine/details/details.service';
import { MarkedTitlesFilterService } from '@/feed/engine/filter/marked-titles/marked-titles.service';
import { AvoidFilterService } from '@/feed/engine/filter/avoid/avoid.service';
import { ScoringService } from '@/feed/engine/scoring/scoring.service';
import { JevScoringService } from '@/feed/engine/scoring/jev/jev.service';
import { OrchestratorService } from '@/feed/engine/orchestrator/orchestrator.service';
import { FeedStorageService } from '@/feed/storage/storage.service';
import { FeedQueueService } from '@/feed/queue/queue.service';
import { FeedProcessor } from '@/feed/queue/queue.processor';

const inputServices = [TasteInputService, LibraryInputService];
const sourceServices = [RecommendationsSourceService, DiscoverSourceService];
const filterServices = [MarkedTitlesFilterService, AvoidFilterService];

@Module({
  imports: [
    BullModule.registerQueue({ name: FEED_QUEUE.name }),
    MovieModule,
    SeriesModule,
    TasteModule,
    LibraryModule,
    TmdbModule,
  ],
  controllers: [FeedController],
  providers: [
    FeedService,
    FeedQueueService,
    FeedProcessor,
    ProgressService,
    DetailsService,
    OrchestratorService,
    FeedStorageService,
    { provide: ScoringService, useClass: JevScoringService },
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
    ...filterServices,
    {
      provide: FEED_FILTERS,
      useFactory: (...filters: FeedFilter[]) => filters,
      inject: filterServices,
    },
  ],
})
export class FeedModule {}
