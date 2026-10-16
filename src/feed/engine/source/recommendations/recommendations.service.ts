import { Injectable } from '@nestjs/common';
import { Title } from '@/feed/engine/engine.types';
import { SourceService } from '@/feed/engine/source/source.service';
import { ProgressService } from '@/feed/engine/progress/progress.service';
import { PageFetchResult } from '@/feed/engine/progress/progress.types';
import {
  RecommendationInput,
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

  async fetch(request: RecommendationsRequest): Promise<RecommendationsResult> {
    const pendingRequests = this.getPendingRequests(request);
    const chosenInput = this.chooseInputByWeight(
      request.inputs,
      pendingRequests,
      Math.random(),
    );
    const requests = this.putNextRequestFirst(pendingRequests, chosenInput);
    const { results, next } = await this.progressService.fetch({
      cursor: requests,
      firstPageRequests: [],
      pageRequestSchema: recommendationsPageSchema,
      fetchPage: (pageRequest) =>
        this.fetchPage(pageRequest, request.mediaType),
    });

    return { candidates: results, next };
  }

  private getPendingRequests({
    inputs,
    cursor,
  }: RecommendationsRequest): RecommendationsPageRequest[] {
    if (cursor !== null) {
      return recommendationsPageSchema.array().parse(cursor);
    }

    // first request
    return inputs.flatMap(({ titleIds }) =>
      titleIds.map((id) => ({ id, page: 1 })),
    );
  }

  private chooseInputByWeight(
    inputs: readonly RecommendationInput[],
    pendingRequests: readonly RecommendationsPageRequest[],
    randomValue: number,
  ): RecommendationInput | null {
    const pendingIds = new Set(pendingRequests.map(({ id }) => id));

    // Only choose inputs that still have a recommendation page left to fetch.
    const availableInputs = inputs.filter(
      ({ titleIds, weight }) =>
        weight > 0 && titleIds.some((id) => pendingIds.has(id)),
    );
    const totalWeight = availableInputs.reduce(
      (sum, input) => sum + input.weight,
      0,
    );
    // a random selection of each input, but weighted based on their weight
    let remainingWeight = randomValue * totalWeight;

    for (const input of availableInputs) {
      remainingWeight -= input.weight; // keeps shrinking remainingWeight

      if (remainingWeight < 0) return input;
    }

    return null;
  }

  private putNextRequestFirst(
    pendingRequests: RecommendationsPageRequest[],
    input: RecommendationInput | null,
  ): RecommendationsPageRequest[] {
    if (input === null) return pendingRequests;

    const titleIds = new Set(input.titleIds);
    // find the index of the first pending request whose titleId belongs to the chosen input.
    const nextIndex = pendingRequests.findIndex(({ id }) => titleIds.has(id));

    if (nextIndex <= 0) return pendingRequests;

    return [
      pendingRequests[nextIndex], // move it to be the first request and fetched next
      ...pendingRequests.slice(0, nextIndex),
      ...pendingRequests.slice(nextIndex + 1),
    ];
  }

  private async fetchPage(
    { id, page }: RecommendationsPageRequest,
    mediaType: MediaType,
  ): Promise<PageFetchResult<RecommendationsPageRequest, Title>> {
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
