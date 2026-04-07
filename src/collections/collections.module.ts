// src/collections/collections.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { CollectionsSyncService } from './collections-sync.service';
import { Collection } from './entities/collection.entity';
import { CollectionItem } from './entities/collection-item.entity';
import { TmdbModule } from '../tmdb/tmdb.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Collection, CollectionItem]),
    TmdbModule,
    CacheModule,
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService, CollectionsSyncService],
})
export class CollectionsModule {}
