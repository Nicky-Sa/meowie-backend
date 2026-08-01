import { FeedCandidate, FeedContext } from '@/feed/types/feed.types';
import {
  POPULARITY_FOR_FULL_SCORE,
  RankingWeights,
  VOTE_COUNT_FOR_FULL_CONFIDENCE,
} from '@/feed/constants/feed.constant';
import {
  CLASSIC_MAX_YEAR,
  ERA,
  MODERN_MIN_YEAR,
  AUTHORITY,
} from '@/taste/constants/journey.constant';

/** Rating, held back until a title has enough votes to trust it. */
const qualityScore = (candidate: FeedCandidate): number => {
  const confidence = Math.min(
    candidate.voteCount / VOTE_COUNT_FOR_FULL_CONFIDENCE,
    1,
  );
  return (candidate.voteAverage / 10) * confidence;
};

/** Titles on the user's side of the era cutoff score 1, the rest 0. */
const eraScore = (candidate: FeedCandidate, era: string | null): number => {
  if (candidate.releaseYear === null) return 0;
  if (era === ERA.CLASSIC)
    return candidate.releaseYear <= CLASSIC_MAX_YEAR ? 1 : 0;
  if (era === ERA.NEW_RELEASE)
    return candidate.releaseYear >= MODERN_MIN_YEAR ? 1 : 0;
  return 0;
};

// TMDB has no separate critic score, so the acclaimed side leans on the
// rating and the crowd side on popularity.
const authorityScore = (
  candidate: FeedCandidate,
  authority: string | null,
): number => {
  if (authority === AUTHORITY.POPULAR) {
    return Math.min(candidate.popularity / POPULARITY_FOR_FULL_SCORE, 1);
  }
  if (authority === AUTHORITY.CRITICS_CHOICE) {
    return qualityScore(candidate);
  }
  return 0;
};

/** Stable per-user jumble: the same seed always orders the same titles alike. */
const shuffleScore = (id: number, shuffleSeed: number): number => {
  let hashed = (id * 2654435761) ^ (shuffleSeed * 40503);
  hashed = (hashed ^ (hashed >>> 15)) >>> 0;
  return (hashed % 100000) / 100000;
};

export const scoreCandidate = (
  candidate: FeedCandidate,
  context: FeedContext,
  weights: RankingWeights,
): number =>
  weights.quality * qualityScore(candidate) +
  weights.era * eraScore(candidate, context.taste.era) +
  weights.authority * authorityScore(candidate, context.taste.authority) +
  weights.shuffle * shuffleScore(candidate.id, context.shuffleSeed) -
  (context.closeToDisliked.has(candidate.id) ? weights.closeToDisliked : 0);
