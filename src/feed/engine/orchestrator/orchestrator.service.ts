import { Inject, Injectable } from '@nestjs/common';
import {
  MAX_DETAILS_AT_ONCE,
  MIN_RATING_FOR_RECOMMENDATIONS,
} from '@/feed/constants/feed.constant';
import { Candidate, CandidateDetails } from '@/feed/engine/candidate.types';
import { DetailsService } from '@/feed/engine/details/details.service';
import { FEED_FILTERS } from '@/feed/engine/filter/filter.service';
import { FeedFilter } from '@/feed/engine/filter/filter.types';
import { FEED_INPUTS } from '@/feed/engine/input/input.service';
import { FeedInput, InputResult } from '@/feed/engine/input/input.types';
import {
  OrchestratorRequest,
  OrchestratorResult,
  SourceResults,
} from '@/feed/engine/orchestrator/orchestrator.types';
import { FEED_SOURCES } from '@/feed/engine/source/source.service';
import { FeedSource } from '@/feed/engine/source/source.types';
import { MediaType } from '@/types/media-type';

@Injectable()
export class OrchestratorService {
  constructor(
    @Inject(FEED_INPUTS)
    private readonly inputServices: readonly FeedInput[],
    @Inject(FEED_SOURCES)
    private readonly sourceServices: readonly FeedSource[],
    private readonly detailsService: DetailsService,
    @Inject(FEED_FILTERS)
    private readonly filterServices: readonly FeedFilter[],
  ) {}

  async run({
    userId,
    mediaType,
    cursors,
  }: OrchestratorRequest): Promise<OrchestratorResult> {
    // step 1: initial titles to build the candidates from
    const inputs = await Promise.all(
      this.inputServices.map((input) => input.read({ userId, mediaType })),
    );

    // step 2: potential candidates from different sources
    const results: Partial<SourceResults> = {};

    await Promise.all(
      this.sourceServices.map(async (source) => {
        switch (source.name) {
          case 'recommendations':
            results.recommendations = await source.fetch({
              titleIds: this.getTitleIdsToRecommendFrom(inputs, mediaType),
              mediaType,
              cursor: cursors.recommendations,
            });
            break;
          case 'discover':
            results.discover = await source.fetch({
              mediaType,
              cursor: cursors.discover,
            });
            break;
        }
      }),
    );

    if (!results.recommendations || !results.discover) {
      throw new Error(
        'Recommendations and Discover sources must be registered.',
      );
    }

    const candidates = this.combineCandidates([
      results.recommendations.candidates,
      results.discover.candidates,
    ]);
    const candidatesDetails = await this.fetchDetails(candidates);

    // step 3: removing invaluable titles
    let filteredCandidates = candidatesDetails;

    for (const filter of this.filterServices) {
      filteredCandidates = await filter.filter({
        userId,
        candidates: filteredCandidates,
      });
    }

    return {
      candidates: filteredCandidates,
      next: {
        recommendations: results.recommendations.next,
        discover: results.discover.next,
      },
    };
  }

  private combineCandidates(
    candidateLists: readonly (readonly Candidate[])[],
  ): Candidate[] {
    const uniqueCandidates = new Map<string, Candidate>();

    for (const candidates of candidateLists) {
      for (const candidate of candidates) {
        uniqueCandidates.set(
          `${candidate.mediaType}:${candidate.id}`,
          candidate,
        );
      }
    }

    return [...uniqueCandidates.values()];
  }

  private async fetchDetails(
    candidates: readonly Candidate[],
  ): Promise<CandidateDetails[]> {
    const result: CandidateDetails[] = [];

    for (
      let start = 0;
      start < candidates.length;
      start += MAX_DETAILS_AT_ONCE
    ) {
      const details = await Promise.all(
        candidates
          .slice(start, start + MAX_DETAILS_AT_ONCE)
          .map((candidate) => this.detailsService.fetch(candidate)),
      );

      for (const candidate of details) {
        if (candidate !== null) result.push(candidate);
      }
    }

    return result;
  }

  private getTitleIdsToRecommendFrom(
    inputs: readonly InputResult[],
    mediaType: MediaType,
  ): number[] {
    const resultIds = new Set<number>(); // final output
    const dislikedIds: number[] = [];
    const ratings = new Map<number, number>();

    for (const input of inputs) {
      switch (input.type) {
        case 'taste':
          for (const title of input.titles.liked) {
            if (title.mediaType === mediaType) resultIds.add(title.id);
          }
          for (const title of input.titles.disliked) {
            if (title.mediaType === mediaType) dislikedIds.push(title.id);
          }
          break;
        case 'library':
          for (const title of input.titles.saved) {
            if (title.mediaType === mediaType) resultIds.add(title.id);
          }
          for (const title of input.titles.seen) {
            if (title.mediaType === mediaType && title.rating !== null) {
              ratings.set(title.id, title.rating);
            }
          }
          break;
      }
    }

    for (const id of dislikedIds) resultIds.delete(id);
    for (const [id, rating] of ratings) {
      if (rating >= MIN_RATING_FOR_RECOMMENDATIONS) {
        resultIds.add(id);
      } else {
        resultIds.delete(id);
      }
    }

    return [...resultIds].sort((a, b) => a - b);
  }
}
