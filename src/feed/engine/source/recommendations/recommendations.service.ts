import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { SourceService } from '@/feed/engine/source/source.service';
import { SourceResult } from '@/feed/engine/source/source.types';
import { RecommendationsRequest } from '@/feed/engine/source/recommendations/recommendations.types';
import { TmdbService } from '@/tmdb/tmdb.service';
import { TMDB_Recommendations } from '@/tmdb/tmdb.type';

const progressSchema = z.array(
  z.object({
    id: z.number().int().positive(),
    page: z.number().int().positive(),
  }),
);

@Injectable()
export class RecommendationsSourceService extends SourceService<RecommendationsRequest> {
  readonly name = 'recommendations';

  constructor(private readonly tmdbService: TmdbService) {
    super();
  }

  async fetch(request: RecommendationsRequest): Promise<SourceResult> {
    const { titleIds, mediaType, cursor } = request;
    const pending =
      cursor === null
        ? titleIds.map((id) => ({
            id,
            page: 1,
          }))
        : progressSchema.parse(JSON.parse(cursor));
    const current = pending.shift();

    if (!current) {
      return { candidates: [], next: { status: 'exhausted' } };
    }

    const response = await this.tmdbService.getRecommendations<
      TMDB_Recommendations<{ id: number }>
    >(mediaType, current.id, current.page);

    if (response.results.length > 0 && current.page < response.total_pages) {
      pending.push({ id: current.id, page: current.page + 1 });
    }

    return {
      candidates: response.results.map(({ id }) => ({ id, mediaType })),
      next:
        pending.length > 0
          ? { status: 'more', cursor: JSON.stringify(pending) }
          : { status: 'exhausted' },
    };
  }
}
