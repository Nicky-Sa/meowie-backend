import { Injectable } from '@nestjs/common';
import { isAxiosError } from 'axios';
import { CacheService } from '@/cache/cache.service';
import { Cacheable } from '@/cache/cacheable.decorator';
import { Duration } from '@/common/app.constants';
import {
  DetailsBatchRequest,
  DetailsBatchResult,
  NullableTitleWithDetail,
} from '@/feed/engine/details/details.types';
import { TmdbService } from '@/tmdb/tmdb.service';
import { TMDB_DetailsWithAppends } from '@/tmdb/tmdb.type';
import { MediaType } from '@/types/media-type';
import { extractYearFromDate } from '@/utils/dates';
import { MAX_DETAILS_AT_ONCE } from '@/feed/constants/feed.constant';
import { Title } from '@/feed/engine/engine.types';

@Injectable()
export class DetailsService {
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly cacheService: CacheService,
  ) {}

  async fetchBatch(titles: DetailsBatchRequest): Promise<DetailsBatchResult> {
    const result: DetailsBatchResult = [];

    for (let start = 0; start < titles.length; start += MAX_DETAILS_AT_ONCE) {
      const titlesWithDetail = await Promise.all(
        titles
          .slice(start, start + MAX_DETAILS_AT_ONCE)
          .map((title) => this.fetchSingle(title)),
      );

      for (const item of titlesWithDetail) {
        if (item !== null) result.push(item);
      }
    }

    return result;
  }

  @Cacheable({
    key: ({ id, mediaType }: Title) => `feed-details-${mediaType}-${id}`,
    ttl: Duration.ONE_WEEK,
  })
  private async fetchSingle({
    id,
    mediaType,
  }: Title): Promise<NullableTitleWithDetail> {
    try {
      const data = await this.tmdbService.getDetails(mediaType, id, [
        'keywords',
      ]);

      return this.toTitleWithDetail({ id, mediaType }, data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  }

  private toTitleWithDetail(
    { id, mediaType }: Title,
    data: TMDB_DetailsWithAppends<MediaType, 'keywords'>,
  ): NullableTitleWithDetail {
    const title = 'title' in data ? data.title : data.name;
    const date =
      'release_date' in data ? data.release_date : data.first_air_date;
    const keywords =
      mediaType === 'movie' ? data.keywords?.keywords : data.keywords?.results;
    const extractedYear = extractYearFromDate(date);
    const year = extractedYear !== 'N/A' ? Number(extractedYear) : null;

    // drop useless titles
    if (
      data.id !== id ||
      !title?.trim() ||
      !data.overview?.trim() ||
      !Array.isArray(data.genres) ||
      !Array.isArray(keywords)
    ) {
      return null;
    }

    return {
      id,
      mediaType,
      title,
      overview: data.overview,
      year,
      genres: data.genres,
      keywords,
    };
  }
}
