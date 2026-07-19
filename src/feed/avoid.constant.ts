import { AvoidChip } from '@/taste/constants/journey.constant';

/**
 * Maps the taste wizard's avoid chips to hard feed exclusions.
 *
 * Genre ids act both as discover-time `without_genres` and as a candidate
 * filter (which also covers the library-recommendation and popular sources).
 * Keyword ids (verified against the TMDB API) act at discover time only —
 * recommendations don't expose keywords, a known gap. "Very long commitment"
 * caps movie runtime at discover time; series carry no length data at discover
 * time, so it's movies-only.
 */

type AvoidRule = {
  genreIds?: number[];
  keywordIds?: number[];
  movieMaxRuntime?: number;
};

const AVOID_RULES_BY_CHIP: Record<AvoidChip, AvoidRule> = {
  Horror: { genreIds: [27] }, // no TV horror genre on TMDB — series gap
  Gore: { keywordIds: [10292] },
  'Very long commitment': { movieMaxRuntime: 150 },
  'Reality TV': { genreIds: [10764] },
  Anime: { keywordIds: [210024] },
  War: { genreIds: [10752, 10768] },
  'Kids content': { genreIds: [10751, 10762] },
  'Soap opera': { genreIds: [10766] },
};

export type AvoidRules = {
  genreIds: Set<number>;
  keywordIds: number[];
  movieMaxRuntime: number | null;
};

export const buildAvoidRules = (avoid: string[]): AvoidRules => {
  const genreIds = new Set<number>();
  const keywordIds: number[] = [];
  let movieMaxRuntime: number | null = null;

  for (const chip of avoid) {
    // Stored rows may hold chips that no longer exist — skip those.
    const rule = AVOID_RULES_BY_CHIP[chip as AvoidChip];
    if (!rule) continue;
    rule.genreIds?.forEach((id) => genreIds.add(id));
    keywordIds.push(...(rule.keywordIds ?? []));
    if (rule.movieMaxRuntime !== undefined) {
      movieMaxRuntime = Math.min(
        movieMaxRuntime ?? Infinity,
        rule.movieMaxRuntime,
      );
    }
  }

  return { genreIds, keywordIds, movieMaxRuntime };
};
