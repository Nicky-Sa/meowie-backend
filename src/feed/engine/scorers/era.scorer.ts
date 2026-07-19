import { Injectable } from '@nestjs/common';
import { BaseScorer } from '@/feed/engine/scorers/base.scorer';
import { FeedContext, FeedCandidate } from '@/feed/engine/engine.types';
import {
  CLASSIC_MAX_YEAR,
  ERA,
  MODERN_MIN_YEAR,
} from '@/taste/constants/journey.constant';

/**
 * Soft boost for the classic/modern answer: titles on the user's side of the
 * era cutoff score 1. 'both' and unanswered mean no era re-ranking.
 */
@Injectable()
export class EraScorer extends BaseScorer {
  readonly key = 'era';

  score(candidate: FeedCandidate, context: FeedContext): number {
    const year = candidate.releaseYear;
    if (year === null) return 0;

    switch (context.taste.era) {
      case ERA.CLASSIC:
        return year <= CLASSIC_MAX_YEAR ? 1 : 0;
      case ERA.NEW_RELEASE:
        return year >= MODERN_MIN_YEAR ? 1 : 0;
      default:
        return 0;
    }
  }
}
