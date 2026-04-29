import { Module } from '@nestjs/common';
import { LibraryService } from './library.service';
import { LibraryController } from './library.controller';
import { LibraryItem } from './entities/library-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvModule } from '../env/env.module';
import { CacheModule } from '../cache/cache.module';
import { MovieModule } from '../movie/movie.module';
import { SeriesModule } from '../series/series.module';
import { ImagesModule } from '../images/images.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LibraryItem]),
    EnvModule,
    CacheModule,
    MovieModule,
    SeriesModule,
    ImagesModule,
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
})
export class LibraryModule {}
