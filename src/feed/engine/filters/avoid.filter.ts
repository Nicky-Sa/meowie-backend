import { Injectable } from '@nestjs/common';
import { BaseFilter } from '@/feed/engine/filters/base.filter';
import { FeedContext, FeedCandidate } from '@/feed/engine/engine.types';

/**
 * Hard-drops candidates carrying an avoided genre. Discover already excludes
 * them; this backstop covers the similar and popular sources.
 */
@Injectable()
export class AvoidFilter extends BaseFilter {
  filter(candidate: FeedCandidate, context: FeedContext): boolean {
    return !candidate.genreIds.some((genreId) =>
      context.avoid.blockedGenreIds.has(genreId),
    );
  }
}
