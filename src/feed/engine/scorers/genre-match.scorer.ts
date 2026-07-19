import { Injectable } from '@nestjs/common';
import { BaseScorer } from '@/feed/engine/scorers/base.scorer';
import { FeedContext, FeedCandidate } from '@/feed/engine/engine.types';
import { addTvGenreIds } from '@/feed/movie-to-tv-genres.constant';

@Injectable()
export class GenreMatchScorer extends BaseScorer {
  readonly key = 'genreMatch';

  score(candidate: FeedCandidate, context: FeedContext): number {
    const genreIds = candidate.genreIds;
    // Taste genres are movie genre ids; series candidates carry TV genre ids,
    // so the matching TV ids are added before comparing.
    const tasteGenres = addTvGenreIds(
      context.profile.genreIds.map((genre) => genre.id),
    );

    if (genreIds.length === 0 || tasteGenres.size === 0) return 0;
    const hits = genreIds.filter((genreId) => tasteGenres.has(genreId)).length;
    return hits / genreIds.length;
  }
}
