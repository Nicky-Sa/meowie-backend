import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LibraryItem } from '@/library/entities/library-item.entity';
import { Repository } from 'typeorm';
import { LIMIT } from '@/common/app.constants';
import {
  LibraryItemQueryDto,
  LibraryStatusResDto,
  MarkSavedReqDto,
  MarkSeenReqDto,
  RemoveItemReqDto,
  UpdateRatingReqDto,
} from '@/library/dto/library.dto';
import { MovieService } from '@/movie/movie.service';
import { SeriesService } from '@/series/series.service';
import { ImagesService } from '@/images/images.service';
import { TMDB_MovieInfo, TMDB_SeriesInfo } from '@/tmdb/tmdb.type';
import { GENRES } from '@/constants/items/genres.constant';
import { getImageWithFallback } from '@/images/images.utils';
import { MediaType } from '@/types/media-type';
import { LibraryCategory } from '@/library/library.constants';
import { PosterResDto } from '@/common/dto/poster.dto';
import { isUniqueConstraintViolation } from '@/database/db-errors.util';

@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(LibraryItem)
    private libraryItemRepository: Repository<LibraryItem>,
    private readonly movieService: MovieService,
    private readonly seriesService: SeriesService,
    private readonly imagesService: ImagesService,
  ) {}

  async getStatus(
    userId: number,
    mediaType: MediaType,
    tmdbId: number,
  ): Promise<LibraryStatusResDto> {
    const items = await this.libraryItemRepository.find({
      where: { userId, tmdbId, mediaType },
    });

    const initialStatus: LibraryStatusResDto = {
      saved: false,
      seen: false,
    };

    return items.reduce<LibraryStatusResDto>((acc, item) => {
      acc[item.category] = true;
      if (item.category === 'seen') {
        acc.rating = item.rating ?? null;
      }
      return acc;
    }, initialStatus);
  }

  async markAsSeen(
    userId: number,
    dto: MarkSeenReqDto,
  ): Promise<LibraryStatusResDto> {
    const updateResult = await this.libraryItemRepository.update(
      {
        userId,
        tmdbId: dto.tmdbId,
        mediaType: dto.mediaType,
        category: 'saved',
      },
      { category: 'seen', rating: dto.rating ?? null },
    );

    // user didn't have this item as saved
    if (updateResult.affected === 0) {
      try {
        const newItem = this.libraryItemRepository.create({
          userId,
          tmdbId: dto.tmdbId,
          mediaType: dto.mediaType,
          category: 'seen',
          rating: dto.rating ?? null,
        });
        await this.libraryItemRepository.save(newItem);
      } catch (error) {
        if (isUniqueConstraintViolation(error)) {
          throw new BadRequestException('Item is already marked as seen');
        }
        throw error;
      }
    }
    return this.getStatus(userId, dto.mediaType, dto.tmdbId);
  }

  async markAsSaved(
    userId: number,
    dto: MarkSavedReqDto,
  ): Promise<LibraryStatusResDto> {
    const updateResult = await this.libraryItemRepository.update(
      {
        userId,
        tmdbId: dto.tmdbId,
        mediaType: dto.mediaType,
        category: 'seen',
      },
      { category: 'saved', rating: null },
    );

    // user didn't have this item as seen
    if (updateResult.affected === 0) {
      try {
        const newItem = this.libraryItemRepository.create({
          userId,
          tmdbId: dto.tmdbId,
          mediaType: dto.mediaType,
          category: 'saved',
          rating: null,
        });
        await this.libraryItemRepository.save(newItem);
      } catch (error) {
        if (isUniqueConstraintViolation(error)) {
          throw new BadRequestException('Item is already saved');
        }
        throw error;
      }
    }
    return this.getStatus(userId, dto.mediaType, dto.tmdbId);
  }

  async removeItem(
    userId: number,
    dto: RemoveItemReqDto,
  ): Promise<LibraryStatusResDto> {
    const result = await this.libraryItemRepository.delete({
      userId,
      tmdbId: dto.tmdbId,
      mediaType: dto.mediaType,
    });

    if (result.affected === 0) {
      throw new BadRequestException('Item does not exist');
    }
    return this.getStatus(userId, dto.mediaType, dto.tmdbId);
  }

  async updateRating(
    userId: number,
    dto: UpdateRatingReqDto,
  ): Promise<LibraryStatusResDto> {
    const result = await this.libraryItemRepository.update(
      {
        userId,
        tmdbId: dto.tmdbId,
        mediaType: dto.mediaType,
        category: 'seen',
      },
      { rating: dto.rating },
    );

    if (result.affected === 0) {
      throw new BadRequestException(
        'Cannot rate an item that is not marked as seen',
      );
    }
    return this.getStatus(userId, dto.mediaType, dto.tmdbId);
  }

  async getLibraryItemsPosters(
    userId: number,
    category: LibraryCategory,
    query: LibraryItemQueryDto,
  ): Promise<PosterResDto> {
    const { page, mediaType } = query;
    const skip = (page - 1) * LIMIT;

    const [items, total] = await this.libraryItemRepository.findAndCount({
      where: { userId, category, ...(mediaType && { mediaType }) },
      order: {
        createdAt: 'DESC',
      },
      take: LIMIT,
      skip,
    });

    const results = await Promise.all(
      items.map(async (item) => {
        const details = await (item.mediaType === 'movie'
          ? this.movieService.getBasicMovieInfo<TMDB_MovieInfo>(item.tmdbId)
          : this.seriesService.getBasicSeriesInfo<TMDB_SeriesInfo>(
              item.tmdbId,
            ));
        const posterPath = getImageWithFallback(
          details.poster_path,
          `${item.mediaType}_poster`,
        );

        const title =
          item.mediaType === 'movie'
            ? (details as TMDB_MovieInfo).title
            : (details as TMDB_SeriesInfo).name;

        const blurhash = this.imagesService.generatePlaceholderBlurhash({
          id: details.id,
        });

        return {
          id: details.id,
          posterPath,
          blurhash,
          mediaType: item.mediaType,
          preview: {
            title,
            overview: details.overview,
            genres: GENRES.filter((genre) =>
              details.genres.some((g) => g.id === genre.id),
            ),
          },
        };
      }),
    );

    return {
      results,
      page,
      total_pages: Math.ceil(total / LIMIT),
      total_results: total,
    };
  }
}
