import { FeedCandidate, FeedContext } from '@/feed/engine/engine.types';
import { ScorerKey } from '@/feed/feed.constants';

export abstract class BaseScorer {
  abstract readonly key: ScorerKey;
  abstract score(candidate: FeedCandidate, context: FeedContext): number;
}
