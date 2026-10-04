import { Inject, Injectable } from '@nestjs/common';
import { MIN_RATING_FOR_RECOMMENDATIONS } from '@/feed/constants/feed.constant';
import { FEED_INPUTS } from '@/feed/engine/input/input.service';
import { FeedInput, InputResult } from '@/feed/engine/input/input.types';
import {
  OrchestratorRequest,
  OrchestratorResult,
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
  ) {}

  async run({
    userId,
    mediaType,
    cursor,
  }: OrchestratorRequest): Promise<OrchestratorResult> {
    const inputs = await Promise.all(
      this.inputServices.map((input) => input.read({ userId, mediaType })),
    );

    const [recommendations] = await Promise.all(
      this.sourceServices.map((source) =>
        source.fetch({
          titleIds: this.getTitleIdsToRecommendFrom(inputs, mediaType),
          mediaType,
          cursor,
        }),
      ),
    );

    if (!recommendations) {
      throw new Error('Recommendations source must be registered.');
    }

    return recommendations;
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
