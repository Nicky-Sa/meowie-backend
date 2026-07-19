import { Module } from '@nestjs/common';
import { FeedController } from '@/feed/feed.controller';
import { FeedService } from '@/feed/feed.service';
import { TasteModule } from '@/taste/taste.module';
import { LibraryModule } from '@/library/library.module';
import { MovieModule } from '@/movie/movie.module';
import { SeriesModule } from '@/series/series.module';
import { TmdbModule } from '@/tmdb/tmdb.module';
import {
  ProfileBuilder,
  FEED_PROFILE_CONTRIBUTORS,
} from '@/feed/profile/profile.builder';
import { TasteContributor } from '@/feed/profile/contributors/taste.contributor';
import { LibraryContributor } from '@/feed/profile/contributors/library.contributor';
import { BaseContributor } from '@/feed/profile/contributors/base.contributor';
import { CandidateGenerator } from '@/feed/engine/candidate-generator';
import {
  EngineService,
  FEED_FILTERS,
  FEED_SCORERS,
} from '@/feed/engine/engine.service';
import { BaseFilter } from '@/feed/engine/filters/base.filter';
import { BaseScorer } from '@/feed/engine/scorers/base.scorer';
import { AlreadyServedFilter } from '@/feed/engine/filters/already-served.filter';
import { ExcludeIdsFilter } from '@/feed/engine/filters/exclude-ids.filter';
import { AvoidGenresFilter } from '@/feed/engine/filters/avoid-genres.filter';
import { GenreMatchScorer } from '@/feed/engine/scorers/genre-match.scorer';
import { QualityScorer } from '@/feed/engine/scorers/quality.scorer';
import { ShuffleScorer } from '@/feed/engine/scorers/shuffle.scorer';
import { EraScorer } from '@/feed/engine/scorers/era.scorer';
import { RealityScorer } from '@/feed/engine/scorers/reality.scorer';
import { AuthorityScorer } from '@/feed/engine/scorers/authority.scorer';

const profileContributors = [TasteContributor, LibraryContributor];
const filters = [AlreadyServedFilter, ExcludeIdsFilter, AvoidGenresFilter];
const scorers = [
  GenreMatchScorer,
  QualityScorer,
  ShuffleScorer,
  EraScorer,
  RealityScorer,
  AuthorityScorer,
];

@Module({
  imports: [TasteModule, LibraryModule, MovieModule, SeriesModule, TmdbModule],
  controllers: [FeedController],
  providers: [
    FeedService,
    ProfileBuilder,
    CandidateGenerator,
    EngineService,
    ...profileContributors,
    ...filters,
    ...scorers,
    {
      provide: FEED_PROFILE_CONTRIBUTORS,
      inject: [...profileContributors],
      useFactory: (...args: BaseContributor[]) => [...args],
    },
    {
      provide: FEED_FILTERS,
      inject: [...filters],
      useFactory: (...args: BaseFilter[]) => [...args],
    },
    {
      provide: FEED_SCORERS,
      inject: [...scorers],
      useFactory: (...args: BaseScorer[]) => [...args],
    },
  ],
})
export class FeedModule {}
