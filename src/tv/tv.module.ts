import { Module } from '@nestjs/common';
import { TvService } from './tv.service';
import { TvController } from './tv.controller';
import { TmdbModule } from '../tmdb/tmdb.module';
import { EnvModule } from '../env/env.module';
import { CacheModule } from '../cache/cache.module';
import { RatingsModule } from '../ratings/ratings.module';
import { ImagesModule } from '../images/images.module';

@Module({
  controllers: [TvController],
  providers: [TvService],
  imports: [TmdbModule, EnvModule, CacheModule, RatingsModule, ImagesModule],
})
export class TvModule {}
