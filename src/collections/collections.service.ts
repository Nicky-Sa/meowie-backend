import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Collection } from '@/collections/entities/collection.entity';
import { CollectionItem } from '@/collections/entities/collection-item.entity';
import { CollectionResDto } from '@/collections/dto/collection.dto';
import { TmdbService } from '@/tmdb/tmdb.service';
import { PosterResDto } from '@/common/dto/poster.dto';
import { getImage } from '@/images/images.utils';
import { Duration, LIMIT } from '@/common/app.constants';
import { Cacheable } from '@/cache/cacheable.decorator';
import { CacheService } from '@/cache/cache.service';
import { MediaType } from '@/types/media-type';
import { PosterInfo } from '@/images/poster';
import { GENRES } from '@/constants/items/genres.constant';
import {
  TMDB_DiscoveredMovieDetail,
  TMDB_DiscoveredSeriesDetail,
  TMDB_MovieInfo,
  TMDB_SeriesInfo,
} from '@/tmdb/tmdb.type';
import { MovieService } from '@/movie/movie.service';
import { SeriesService } from '@/series/series.service';
import { ImagesService } from '@/images/images.service';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(CollectionItem)
    private readonly collectionItemRepository: Repository<CollectionItem>,
    private readonly tmdbService: TmdbService,
    private readonly cacheService: CacheService,
    private readonly movieService: MovieService,
    private readonly seriesService: SeriesService,
    private readonly imagesService: ImagesService,
  ) {}

  @Cacheable({
    key: (parentId: number | null) => `collections-${parentId ?? 'root'}`,
    ttl: Duration.ONE_HOUR,
  })
  async getCollections(parentId: number | null): Promise<CollectionResDto[]> {
    const where =
      parentId === null
        ? { parentId: IsNull(), isActive: true }
        : { parentId, isActive: true };

    const collections = await this.collectionRepository.find({
      where,
      order: { position: 'ASC' },
    });

    return collections;
  }

  async getCollectionItems(slug: string, page: number): Promise<PosterResDto> {
    const collection = await this.collectionRepository.findOneBy({ slug });

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

    const response = await this.tmdbService.getList<
      TMDB_DiscoveredMovieDetail | TMDB_DiscoveredSeriesDetail
    >(collection.tmdbEndpoint, {
      ...(collection.tmdbParams ?? {}),
      page,
    });

    const mediaType: MediaType =
      collection.mediaType === 'series' ? 'series' : 'movie';
    const posterType =
      mediaType === 'series' ? 'series_poster' : 'movie_poster';

    const results: PosterInfo[] = response.results
      .filter((item) => item.poster_path && ('title' in item || 'name' in item))
      .map((item) => {
        const title = 'title' in item ? item.title : item.name;
        const genreIds = item.genre_ids || [];
        const posterPath = getImage(item.poster_path, posterType);
        const blurhash = this.imagesService.generatePlaceholderBlurhash({
          id: item.id,
        });

        return {
          id: item.id,
          posterPath,
          blurhash,
          mediaType,
          preview: {
            title,
            genres: GENRES.filter((g) => genreIds.includes(g.id)),
            overview: item.overview || '',
          },
        };
      });

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

    const [items, total] = await this.collectionItemRepository.findAndCount({
      where: { collectionId: collection.id },
      order: { position: 'ASC' },
      skip,
      take,
    });

    const mediaType: MediaType =
      collection.mediaType === 'series' ? 'series' : 'movie';
    const posterType =
      mediaType === 'series' ? 'series_poster' : 'movie_poster';

    const results = await Promise.all(
      items.map(async (item) => {
        const details = await (mediaType === 'movie'
          ? this.movieService.getBasicMovieInfo<TMDB_MovieInfo>(item.tmdbId)
          : this.seriesService.getBasicSeriesInfo<TMDB_SeriesInfo>(
              item.tmdbId,
            ));

        const title = 'title' in details ? details.title : details.name;

        const posterPath = getImage(details.poster_path, posterType);
        const blurhash = this.imagesService.generatePlaceholderBlurhash({
          id: item.tmdbId,
        });

        return {
          id: item.tmdbId,
          posterPath,
          blurhash,
          mediaType,
          preview: {
            title,
            genres: GENRES.filter((genre) =>
              details.genres.some((g) => g.id === genre.id),
            ),
            overview: details.overview || '',
          },
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
