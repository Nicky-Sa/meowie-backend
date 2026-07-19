import { Injectable } from '@nestjs/common';
import { BaseScorer } from '@/feed/engine/scorers/base.scorer';
import { FeedCandidate } from '@/feed/engine/engine.types';
import { VOTE_COUNT_FOR_FULL_CONFIDENCE } from '@/feed/feed.constants';

@Injectable()
export class QualityScorer extends BaseScorer {
  readonly key = 'quality';

  score(candidate: FeedCandidate): number {
    const confidence = Math.min(
      candidate.voteCount / VOTE_COUNT_FOR_FULL_CONFIDENCE,
      1,
    );
    return (candidate.voteAverage / 10) * confidence;
  }
}
