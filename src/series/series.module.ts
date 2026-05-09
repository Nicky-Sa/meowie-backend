import { Module } from '@nestjs/common';
import { SeriesService } from './series.service';
import { SeriesController } from './series.controller';
import { TmdbModule } from '../tmdb/tmdb.module';
import { RatingsModule } from '../ratings/ratings.module';
import { ImagesModule } from '../images/images.module';

@Module({
  controllers: [SeriesController],
  providers: [SeriesService],
  imports: [TmdbModule, RatingsModule, ImagesModule],
  exports: [SeriesService],
})
export class SeriesModule {}
