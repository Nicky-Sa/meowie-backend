import { Injectable } from '@nestjs/common';
import { BaseFilter } from '@/feed/engine/filters/base.filter';
import { FeedContext, FeedCandidate } from '@/feed/engine/engine.types';

/**
 * Hard-drops candidates carrying an avoided genre. Discover already excludes
 * them via `without_genres`; this backstop covers the recommendation and
 * popular sources, which can't be filtered at the source.
 */
@Injectable()
export class AvoidGenresFilter extends BaseFilter {
  filter(candidate: FeedCandidate, context: FeedContext): boolean {
    return !candidate.genreIds.some((genreId) =>
      context.avoid.genreIds.has(genreId),
    );
  }
}
