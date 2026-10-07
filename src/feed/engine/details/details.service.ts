import { Injectable } from '@nestjs/common';
import { isAxiosError } from 'axios';
import { CacheService } from '@/cache/cache.service';
import { Cacheable } from '@/cache/cacheable.decorator';
import { Duration } from '@/common/app.constants';
import {
  DetailsBatchRequest,
  DetailsBatchResult,
  NullableCandidateDetails,
} from '@/feed/engine/details/details.types';
import { TmdbService } from '@/tmdb/tmdb.service';
import { TMDB_DetailsWithAppends } from '@/tmdb/tmdb.type';
import { MediaType } from '@/types/media-type';
import { extractYearFromDate } from '@/utils/dates';
import { MAX_DETAILS_AT_ONCE } from '@/feed/constants/feed.constant';
import { Candidate } from '@/feed/engine/candidate.types';

@Injectable()
export class DetailsService {
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly cacheService: CacheService,
  ) {}

  async fetchBatch(
    candidates: DetailsBatchRequest,
  ): Promise<DetailsBatchResult> {
    const result: DetailsBatchResult = [];

    for (
      let start = 0;
      start < candidates.length;
      start += MAX_DETAILS_AT_ONCE
    ) {
      const details = await Promise.all(
        candidates
          .slice(start, start + MAX_DETAILS_AT_ONCE)
          .map((candidate) => this.fetchSingle(candidate)),
      );

      for (const candidate of details) {
        if (candidate !== null) result.push(candidate);
      }
    }

    return result;
  }

  @Cacheable({
    key: ({ id, mediaType }: Candidate) => `feed-details-${mediaType}-${id}`,
    ttl: Duration.ONE_WEEK,
  })
  private async fetchSingle({
    id,
    mediaType,
  }: Candidate): Promise<NullableCandidateDetails> {
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
    { id, mediaType }: Candidate,
    data: TMDB_DetailsWithAppends<MediaType, 'keywords'>,
  ): NullableCandidateDetails {
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
