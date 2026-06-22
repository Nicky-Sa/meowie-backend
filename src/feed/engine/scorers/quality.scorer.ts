import { Injectable } from '@nestjs/common';
import { BaseScorer } from '@/feed/engine/scorers/base.scorer';
import { FeedCandidate } from '@/feed/engine/engine.types';

@Injectable()
export class QualityScorer extends BaseScorer {
  readonly key = 'quality';

  score(candidate: FeedCandidate): number {
    const confidence = Math.min(candidate.voteCount / 300, 1);
    return (candidate.voteAverage / 10) * confidence;
  }
}
