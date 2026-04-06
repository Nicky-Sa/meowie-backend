// src/collections/collections.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { CollectionItem } from './entities/collection-item.entity';
import { CollectionResDto } from './dto/collection.dto';
import { TmdbService } from '../tmdb/tmdb.service';
import { PosterResDto } from '../common/dto/poster.dto';
import { getImage } from '../images/images.utils';
import { DEFAULT_BLURHASH, LIMIT } from '../common/app.constants';
import { Cacheable } from '../cache/cacheable.decorator';
import { CacheService } from '../cache/cache.service';
import { CacheDuration } from '../cache/cache.constants';
import { MediaType } from '../types/media-type';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
    @InjectRepository(CollectionItem)
    private readonly itemRepo: Repository<CollectionItem>,
    private readonly tmdb: TmdbService,
    private readonly cacheService: CacheService,
  ) {}

  @Cacheable({
    key: (parentId: number | null) => `collections-${parentId ?? 'root'}`,
    ttl: CacheDuration.ONE_HOUR,
  })
  async getCollections(parentId: number | null): Promise<CollectionResDto[]> {
    const where =
      parentId === null
        ? { parentId: IsNull(), isActive: true }
        : { parentId, isActive: true };

    const collections = await this.collectionRepo.find({
      where,
      order: { position: 'ASC' },
    });

    return collections;
  }

  async getCollectionItems(slug: string, page: number): Promise<PosterResDto> {
    const collection = await this.collectionRepo.findOneBy({ slug });

    if (!collection) {
      throw new NotFoundException(`Collection "${slug}" not found`);
    }

    if (collection.sourceType === 'group') {
      throw new BadRequestException(
        'Cannot fetch items for a group collection',
      );
    }

    if (collection.sourceType === 'tmdb_endpoint') {
      return this.resolveTmdbItems(collection, page);
    }

    return this.resolveManualItems(collection, page);
  }

  private async resolveTmdbItems(
    collection: Collection,
    page: number,
  ): Promise<PosterResDto> {
    if (!collection.tmdbEndpoint) {
      throw new BadRequestException(
        `Collection "${collection.slug}" has source_type 'tmdb_endpoint' but no endpoint configured`,
      );
    }

    const response = await this.tmdb.getList(collection.tmdbEndpoint, {
      ...(collection.tmdbParams ?? {}),
      page,
    });

    const posterType =
      collection.mediaType === 'series' ? 'series_poster' : 'movie_poster';
    const mediaType: MediaType =
      collection.mediaType === 'series' ? 'series' : 'movie';

    const results = response.results
      .filter((item) => item.poster_path && (item.title || item.name))
      .map((item) => ({
        id: item.id as number,
        posterPath: getImage(item.poster_path as string, posterType),
        blurhash: DEFAULT_BLURHASH,
        mediaType,
      }));

    return {
      page: response.page,
      results,
      total_pages: response.total_pages,
      total_results: response.total_results,
    };
  }

  private async resolveManualItems(
    collection: Collection,
    page: number,
  ): Promise<PosterResDto> {
    const take = LIMIT;
    const skip = (page - 1) * take;

    const [items, total] = await this.itemRepo.findAndCount({
      where: { collectionId: collection.id },
      order: { position: 'ASC' },
      skip,
      take,
    });

    const mediaType: MediaType =
      collection.mediaType === 'series' ? 'series' : 'movie';
    const posterType =
      collection.mediaType === 'series' ? 'series_poster' : 'movie_poster';

    const results = await Promise.all(
      items.map(async (item) => {
        const details = await this.tmdb.getDetails<{
          id: number;
          poster_path: string | null;
        }>(mediaType, item.tmdbId);

        return {
          id: item.tmdbId,
          posterPath: getImage(details.poster_path, posterType),
          blurhash: DEFAULT_BLURHASH,
          mediaType,
        };
      }),
    );

    return {
      page,
      results,
      total_pages: Math.ceil(total / take),
      total_results: total,
    };
  }
}
