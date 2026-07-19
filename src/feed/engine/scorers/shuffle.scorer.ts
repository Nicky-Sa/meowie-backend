import { Injectable } from '@nestjs/common';
import { BaseScorer } from '@/feed/engine/scorers/base.scorer';
import { FeedContext, FeedCandidate } from '@/feed/engine/engine.types';

@Injectable()
export class ShuffleScorer extends BaseScorer {
  readonly key = 'shuffle';

  score(candidate: FeedCandidate, context: FeedContext): number {
    let hashed = (candidate.id * 2654435761) ^ (context.shuffleSeed * 40503);
    hashed = (hashed ^ (hashed >>> 15)) >>> 0;
    return (hashed % 100000) / 100000;
  }
}
