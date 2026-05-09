import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsController } from '@/collections/collections.controller';
import { CollectionsService } from '@/collections/collections.service';
import { CollectionsSyncService } from '@/collections/collections-sync.service';
import { Collection } from '@/collections/entities/collection.entity';
import { CollectionItem } from '@/collections/entities/collection-item.entity';
import { TmdbModule } from '@/tmdb/tmdb.module';
import { MovieModule } from '@/movie/movie.module';
import { SeriesModule } from '@/series/series.module';
import { ImagesModule } from '@/images/images.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Collection, CollectionItem]),
    TmdbModule,
    MovieModule,
    SeriesModule,
    ImagesModule,
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService, CollectionsSyncService],
})
export class CollectionsModule {}
