import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TmdbModule } from '../tmdb/tmdb.module';
import { EnvModule } from '../env/env.module';
import { CacheModule } from '../cache/cache.module';
import { RatingsModule } from '../ratings/ratings.module';
import { ImagesModule } from '../images/images.module';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService],
  imports: [EnvModule, CacheModule, TmdbModule, RatingsModule, ImagesModule],
  exports: [MoviesService],
})
export class MoviesModule {}
