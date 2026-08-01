import { AvoidId } from '@/taste/constants/journey.constant';

/**
 * Maps the taste wizard's avoid chips to hard feed exclusions. Not every chip
 * is a genre — TMDB labels titles two ways, and some ideas only exist as one.
 */

type AvoidRule = {
  genreIds?: number[];
  keywordIds?: number[];
};

const AVOID_RULES_BY_ID: Record<AvoidId, AvoidRule> = {
  // TMDB has no TV horror genre, so the keyword carries the series side.
  horror: { genreIds: [27], keywordIds: [315058] },
  gore: { keywordIds: [10292] },
  anime: { keywordIds: [210024] },
  war: { genreIds: [10752, 10768] },
  documentaries: { genreIds: [99] },
  // Movies only: TMDB has no music or musical genre for series.
  musicals: { genreIds: [10402] },
};

export type AvoidRules = {
  blockedGenreIds: Set<number>;
  blockedKeywordIds: number[];
};

export const buildAvoidRules = (avoid: AvoidId[]): AvoidRules => {
  const blockedGenreIds = new Set<number>();
  const blockedKeywordIds: number[] = [];

  for (const chipId of avoid) {
    const rule = AVOID_RULES_BY_ID[chipId];
    rule.genreIds?.forEach((id) => blockedGenreIds.add(id));
    blockedKeywordIds.push(...(rule.keywordIds ?? []));
  }

  return { blockedGenreIds, blockedKeywordIds };
};
