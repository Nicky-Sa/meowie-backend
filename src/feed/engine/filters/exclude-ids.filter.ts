import { Injectable } from '@nestjs/common';
import { BaseFilter } from '@/feed/engine/filters/base.filter';
import { FeedContext, FeedCandidate } from '@/feed/engine/engine.types';

@Injectable()
export class ExcludeIdsFilter extends BaseFilter {
  filter(candidate: FeedCandidate, context: FeedContext): boolean {
    return !context.excludeIds.has(candidate.id);
  }
}
