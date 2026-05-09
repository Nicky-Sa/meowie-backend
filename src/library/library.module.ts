import { Module } from '@nestjs/common';
import { LibraryService } from '@/library/library.service';
import { LibraryController } from '@/library/library.controller';
import { LibraryItem } from '@/library/entities/library-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieModule } from '@/movie/movie.module';
import { SeriesModule } from '@/series/series.module';
import { ImagesModule } from '@/images/images.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LibraryItem]),
    MovieModule,
    SeriesModule,
    ImagesModule,
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
})
export class LibraryModule {}
