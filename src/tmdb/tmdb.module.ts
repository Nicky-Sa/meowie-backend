import { Module } from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { EnvModule } from '../env/env.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [EnvModule, CacheModule],
  providers: [TmdbService],
  exports: [TmdbService],
})
export class TmdbModule {}
