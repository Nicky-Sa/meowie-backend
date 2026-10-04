import { Injectable } from '@nestjs/common';
import { isAxiosError } from 'axios';
import { CacheService } from '@/cache/cache.service';
import { Cacheable } from '@/cache/cacheable.decorator';
import { Duration } from '@/common/app.constants';
import {
  DetailsRequest,
  DetailsResult,
} from '@/feed/engine/details/details.types';
import { TmdbService } from '@/tmdb/tmdb.service';
import { TMDB_DetailsWithAppends } from '@/tmdb/tmdb.type';
import { MediaType } from '@/types/media-type';
import { extractYearFromDate } from '@/utils/dates';

@Injectable()
export class DetailsService {
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly cacheService: CacheService,
  ) {}

  @Cacheable({
    key: ({ id, mediaType }: DetailsRequest) =>
      `feed-details-${mediaType}-${id}`,
    ttl: Duration.ONE_WEEK,
  })
  async fetch({ id, mediaType }: DetailsRequest): Promise<DetailsResult> {
    try {
      const data = await this.tmdbService.getDetails(mediaType, id, [
        'keywords',
      ]);

      return this.toCandidateDetails({ id, mediaType }, data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) return null;
      throw error;
    }
  }

  private toCandidateDetails(
    { id, mediaType }: DetailsRequest,
    data: TMDB_DetailsWithAppends<MediaType, 'keywords'>,
  ): DetailsResult {
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
