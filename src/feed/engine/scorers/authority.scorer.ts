import { Injectable } from '@nestjs/common';
import { BaseScorer } from '@/feed/engine/scorers/base.scorer';
import { FeedContext, FeedCandidate } from '@/feed/engine/engine.types';
import {
  POPULARITY_FOR_FULL_SCORE,
  VOTE_COUNT_FOR_FULL_CONFIDENCE,
} from '@/feed/feed.constants';
import { TASTE_AUTHORITY } from '@/taste/constants/journey.constant';

/**
 * Soft boost for the crowd/acclaimed answer: crowd favors popularity, critic
 * favors rating (vote-count-weighted — TMDB has no separate critic score).
 * 'both' and unanswered mean no authority re-ranking.
 */
@Injectable()
export class AuthorityScorer extends BaseScorer {
  readonly key = 'authority';

  score(candidate: FeedCandidate, context: FeedContext): number {
    switch (context.taste.tasteAuthority) {
      case TASTE_AUTHORITY.POPULAR:
        return Math.min(candidate.popularity / POPULARITY_FOR_FULL_SCORE, 1);
      case TASTE_AUTHORITY.CRITICS_CHOICE: {
        const confidence = Math.min(
          candidate.voteCount / VOTE_COUNT_FOR_FULL_CONFIDENCE,
          1,
        );
        return (candidate.voteAverage / 10) * confidence;
      }
      default:
        return 0;
    }
  }
}
