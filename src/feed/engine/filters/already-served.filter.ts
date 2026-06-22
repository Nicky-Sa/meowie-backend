import { Injectable } from '@nestjs/common';
import { BaseFilter } from '@/feed/engine/filters/base.filter';
import { FeedContext, FeedCandidate } from '@/feed/engine/engine.types';

@Injectable()
export class AlreadyServedFilter extends BaseFilter {
  filter(candidate: FeedCandidate, context: FeedContext): boolean {
    return !context.served.has(candidate.id);
  }
}
