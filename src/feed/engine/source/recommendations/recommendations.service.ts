import { Injectable } from '@nestjs/common';
import { Candidate } from '@/feed/engine/candidate.types';
import { SourceService } from '@/feed/engine/source/source.service';
import { ProgressService } from '@/feed/engine/progress/progress.service';
import { PageFetchResult } from '@/feed/engine/progress/progress.types';
import {
  recommendationsPageSchema,
  RecommendationsPageRequest,
  RecommendationsRequest,
  RecommendationsResult,
} from '@/feed/engine/source/recommendations/recommendations.types';
import { TmdbService } from '@/tmdb/tmdb.service';
import { TMDB_Recommendations } from '@/tmdb/tmdb.type';
import { MediaType } from '@/types/media-type';

@Injectable()
export class RecommendationsSourceService extends SourceService<
  RecommendationsRequest,
  RecommendationsResult
> {
  readonly name = 'recommendations';

  constructor(
    private readonly tmdbService: TmdbService,
    private readonly progressService: ProgressService,
  ) {
    super();
  }

  async fetch({
    titleIds,
    mediaType,
    cursor,
  }: RecommendationsRequest): Promise<RecommendationsResult> {
    const { results, next } = await this.progressService.fetch({
      cursor,
      firstPageRequests: titleIds.map((id) => ({ id, page: 1 })),
      pageRequestSchema: recommendationsPageSchema,
      fetchPage: (request) => this.fetchPage(request, mediaType),
    });

    return { candidates: results, next };
  }

  private async fetchPage(
    { id, page }: RecommendationsPageRequest,
    mediaType: MediaType,
  ): Promise<PageFetchResult<RecommendationsPageRequest, Candidate>> {
    const response = await this.tmdbService.getRecommendations<
      TMDB_Recommendations<{ id: number }>
    >(mediaType, id, page);

    return {
      results: response.results.map(({ id }) => ({ id, mediaType })),
      nextRequest:
        response.results.length > 0 && page < response.total_pages
          ? { id, page: page + 1 }
          : null,
    };
  }
}
