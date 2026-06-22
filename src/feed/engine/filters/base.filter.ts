import { FeedCandidate, FeedContext } from '@/feed/engine/engine.types';

export abstract class BaseFilter {
  abstract filter(candidate: FeedCandidate, context: FeedContext): boolean;
}
