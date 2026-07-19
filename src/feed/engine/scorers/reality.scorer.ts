import { Injectable } from '@nestjs/common';
import { BaseScorer } from '@/feed/engine/scorers/base.scorer';
import { FeedContext, FeedCandidate } from '@/feed/engine/engine.types';
import {
  ESCAPIST_GENRE_IDS,
  GROUNDED_GENRE_IDS,
  REALITY,
} from '@/taste/constants/journey.constant';

const GROUNDED = new Set(GROUNDED_GENRE_IDS);
const ESCAPIST = new Set(ESCAPIST_GENRE_IDS);

/**
 * Soft boost for the grounded/escapist answer: the fraction of a candidate's
 * genres inside the chosen lean. The spec also suggests keyword boosts, but
 * discover results carry no keywords — genres only.
 */
@Injectable()
export class RealityScorer extends BaseScorer {
  readonly key = 'reality';

  score(candidate: FeedCandidate, context: FeedContext): number {
    const lean =
      context.taste.reality === REALITY.REALISTIC
        ? GROUNDED
        : context.taste.reality === REALITY.FANTASY
          ? ESCAPIST
          : null;
    if (!lean || candidate.genreIds.length === 0) return 0;

    const hits = candidate.genreIds.filter((genreId) =>
      lean.has(genreId),
    ).length;
    return hits / candidate.genreIds.length;
  }
}
