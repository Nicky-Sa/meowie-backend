import { Injectable } from '@nestjs/common';
import { Candidate } from '@/feed/engine/candidate.types';
import { SourceService } from '@/feed/engine/source/source.service';
import { ProgressService } from '@/feed/engine/progress/progress.service';
import { PageFetchResult } from '@/feed/engine/progress/progress.types';
import {
  discoverPageSchema,
  DiscoverPageRequest,
  DiscoverRequest,
  DiscoverResult,
} from '@/feed/engine/source/discover/discover.types';
import {
  DISCOVER_MIN_MOVIE_RUNTIME,
  DISCOVER_MIN_VOTE_AVERAGE,
  DISCOVER_MIN_VOTE_COUNT,
  TMDB_MAX_PAGE,
} from '@/feed/constants/feed.constant';
import { TmdbService } from '@/tmdb/tmdb.service';
import {
  TMDB_DiscoverMovieQuery,
  TMDB_DiscoverSeriesQuery,
} from '@/tmdb/tmdb.type';
import { PaginatedResponse } from '@/common/types/paginated-response';
import { MediaType } from '@/types/media-type';

@Injectable()
export class DiscoverSourceService extends SourceService<
  DiscoverRequest,
  DiscoverResult
> {
  readonly name = 'discover';

  constructor(
    private readonly tmdbService: TmdbService,
    private readonly progressService: ProgressService,
  ) {
    super();
  }

  async fetch({ mediaType, cursor }: DiscoverRequest): Promise<DiscoverResult> {
    const { results, next } = await this.progressService.fetch({
      cursor,
      firstPageRequests: [{ page: 1 }],
      pageRequestSchema: discoverPageSchema,
      fetchPage: (request) => this.fetchPage(request, mediaType),
    });

    return { candidates: results, next };
  }

  private async fetchPage(
    { page }: DiscoverPageRequest,
    mediaType: MediaType,
  ): Promise<PageFetchResult<DiscoverPageRequest, Candidate>> {
    const response = await this.discover(mediaType, page);
    const lastPage = Math.min(response.total_pages, TMDB_MAX_PAGE);

    return {
      results: response.results.map(({ id }) => ({ id, mediaType })),
      nextRequest:
        response.results.length > 0 && page < lastPage
          ? { page: page + 1 }
          : null,
    };
  }

  // include_adult=false is already applied by TmdbService for every request
  private async discover(
    mediaType: MediaType,
    page: number,
  ): Promise<PaginatedResponse<{ id: number }>> {
    const sharedQuery = {
      page,
      sort_by: 'popularity.desc',
      'vote_count.gte': DISCOVER_MIN_VOTE_COUNT,
      'vote_average.gte': DISCOVER_MIN_VOTE_AVERAGE,
    } as const;

    switch (mediaType) {
      case 'movie':
        return this.tmdbService.getDiscover<
          PaginatedResponse<{ id: number }>,
          TMDB_DiscoverMovieQuery
        >(mediaType, {
          ...sharedQuery,
          'with_runtime.gte': DISCOVER_MIN_MOVIE_RUNTIME,
        });
      case 'series':
        return this.tmdbService.getDiscover<
          PaginatedResponse<{ id: number }>,
          TMDB_DiscoverSeriesQuery
        >(mediaType, { ...sharedQuery });
    }
  }
}
