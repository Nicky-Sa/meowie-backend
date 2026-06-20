import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CollectionsController } from '@/collections/collections.controller';
import { CollectionsService } from '@/collections/collections.service';
import { CollectionsSyncService } from '@/collections/collections-sync.service';
import { CollectionsSyncQueueService } from '@/collections/collections-sync-queue.service';
import { CollectionsProcessor } from '@/collections/collections.processor';
import { Collection } from '@/collections/entities/collection.entity';
import { CollectionItem } from '@/collections/entities/collection-item.entity';
import { TmdbModule } from '@/tmdb/tmdb.module';
import { MovieModule } from '@/movie/movie.module';
import { SeriesModule } from '@/series/series.module';
import { ImagesModule } from '@/images/images.module';
import { COLLECTIONS_SYNC_QUEUE } from '@/common/queue.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Collection, CollectionItem]),
    BullModule.registerQueue({ name: COLLECTIONS_SYNC_QUEUE.name }),
    TmdbModule,
    MovieModule,
    SeriesModule,
    ImagesModule,
  ],
  controllers: [CollectionsController],
  providers: [
    CollectionsService,
    CollectionsSyncService,
    CollectionsSyncQueueService,
    CollectionsProcessor,
  ],
})
export class CollectionsModule {}
