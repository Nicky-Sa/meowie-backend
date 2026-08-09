import { AvoidId } from '@/taste/constants/journey.constant';

type AvoidRule = {
  genreIds?: number[];
  keywordIds?: number[];
};

// Movie and series ids sit together. 10752 is War for movies, 10768 is War &
// Politics for series. A movie is never tagged 10768, so mixing them is safe.
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
  blockedKeywordIds: Set<number>;
};

export const buildAvoidRules = (avoid: AvoidId[]): AvoidRules => {
  const blockedGenreIds = new Set<number>();
  const blockedKeywordIds = new Set<number>();

  for (const chipId of avoid) {
    const rule = AVOID_RULES_BY_ID[chipId];
    rule.genreIds?.forEach((id) => blockedGenreIds.add(id));
    rule.keywordIds?.forEach((id) => blockedKeywordIds.add(id));
  }

  return { blockedGenreIds, blockedKeywordIds };
};
