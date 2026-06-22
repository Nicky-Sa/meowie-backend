import { Injectable } from '@nestjs/common';
import { BaseScorer } from '@/feed/engine/scorers/base.scorer';
import { FeedCandidate } from '@/feed/engine/engine.types';

@Injectable()
export class SimilarSourceScorer extends BaseScorer {
  readonly key = 'similar';

  score(candidate: FeedCandidate): number {
    return candidate.source === 'similar' ? 1 : 0;
  }
}
