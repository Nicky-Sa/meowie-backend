import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LibraryItem } from './entities/library-item.entity';
import { Repository } from 'typeorm';
import { LIMIT } from '../common/app.constants';
import {
  LibraryItemQueryDto,
  LibraryStatusResDto,
  ToggleLibraryItemReqDto,
} from './dto/library.dto';
import { TmdbService } from '../tmdb/tmdb.service';
import { TMDB_MovieDetail } from '../tmdb/tmdb.type';
import { getImage } from '../images/images.utils';
import { MediaType } from '../types/media-type';
import { LibraryCategory } from './library.constants';
import { PosterResDto } from '../common/dto/poster.dto';

@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(LibraryItem)
    private libraryItemRepository: Repository<LibraryItem>,
    private readonly tmdbService: TmdbService,
  ) {}

  async getStatus(
    userId: number,
    mediaType: MediaType,
    tmdbId: number,
  ): Promise<LibraryStatusResDto> {
    const items = await this.libraryItemRepository.find({
      where: { userId, tmdbId, mediaType },
    });

    return items.reduce((acc, item) => {
      acc[item.category] = true;
      return acc;
    }, {});
  }

  async toggleItem(
    userId: number,
    dto: ToggleLibraryItemReqDto,
  ): Promise<LibraryStatusResDto> {
    const existing = await this.libraryItemRepository.findOne({
      where: {
        userId,
        tmdbId: dto.tmdbId,
        mediaType: dto.mediaType,
        category: dto.category,
      },
    });

    if (existing) {
      await this.libraryItemRepository.remove(existing);
      return { [dto.category]: false };
    }

    const newItem = this.libraryItemRepository.create({
      userId,
      ...dto,
    });

    await this.libraryItemRepository.save(newItem);
    return { [dto.category]: true };
  }

  async getLibraryItemsPosters(
    userId: number,
    category: LibraryCategory,
    mediaType: MediaType,
    query: LibraryItemQueryDto,
  ): Promise<PosterResDto> {
    const { page } = query;
    const skip = (page - 1) * LIMIT;

    const [items, total] = await this.libraryItemRepository.findAndCount({
      where: { userId, category, mediaType },
      order: {
        createdAt: 'DESC',
      },
      take: LIMIT,
      skip,
    });

    const results = await Promise.all(
      items.map(async (item) => {
        const details = await this.tmdbService.getDetails<TMDB_MovieDetail>(
          item.mediaType,
          item.tmdbId,
        );
        const posterPath = getImage(details.poster_path, 'poster');
        const blurhash = 'U11o;?of00of00of00of00of00of00of00of';
        return {
          id: details.id,
          posterPath,
          blurhash,
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
