import { Injectable } from '@nestjs/common';
import { BaseScorer } from '@/feed/engine/scorers/base.scorer';
import { FeedContext, FeedCandidate } from '@/feed/engine/engine.types';

@Injectable()
export class GenreMatchScorer extends BaseScorer {
  readonly key = 'genreMatch';

  score(candidate: FeedCandidate, context: FeedContext): number {
    const genreIds = candidate.genreIds;
    const tasteGenres = new Set(context.profile.genreIds.map((g) => g.id));

    if (genreIds.length === 0 || tasteGenres.size === 0) return 0;
    const hits = genreIds.filter((g) => tasteGenres.has(g)).length;
    return hits / genreIds.length;
  }
}
