import { Logger } from '@nestjs/common';
import { AvoidId } from '@/taste/constants/journey.constant';

/**
 * Maps the taste wizard's avoid chips to hard feed exclusions. Not every chip
 * is a genre — TMDB labels titles two ways, and some ideas only exist as one.
 */

type AvoidRule = {
  genreIds?: number[];
  keywordIds?: number[];
  movieMaxRuntime?: number;
  seriesMaxEpisodes?: number;
};

const AVOID_RULES_BY_ID: Record<AvoidId, AvoidRule> = {
  // TMDB has no TV horror genre, so the keyword carries the series side.
  horror: { genreIds: [27], keywordIds: [315058] },
  gore: { keywordIds: [10292] },
  // Episodes, not seasons: a season means nothing consistent (Midsomer
  // Murders has 25 seasons and 144 episodes, Doraemon 27 and 1836).
  'long-watches': { movieMaxRuntime: 150, seriesMaxEpisodes: 100 },
  'reality-tv': { genreIds: [10764] },
  anime: { keywordIds: [210024] },
  war: { genreIds: [10752, 10768] },
  'kids-content': { genreIds: [10762] },
  'soap-opera': { genreIds: [10766] },
};

export type AvoidRules = {
  blockedGenreIds: Set<number>;
  blockedKeywordIds: number[];
  movieMaxRuntime: number | null;
  seriesMaxEpisodes: number | null;
};

const logger = new Logger('AvoidRules');

export const buildAvoidRules = (avoid: string[]): AvoidRules => {
  const blockedGenreIds = new Set<number>();
  const blockedKeywordIds: number[] = [];
  let movieMaxRuntime: number | null = null;
  let seriesMaxEpisodes: number | null = null;

  for (const chipId of avoid) {
    const rule = AVOID_RULES_BY_ID[chipId as AvoidId];
    if (!rule) {
      logger.warn(`Stored taste holds an unknown avoid chip: ${chipId}`);
      continue;
    }
    rule.genreIds?.forEach((id) => blockedGenreIds.add(id));
    blockedKeywordIds.push(...(rule.keywordIds ?? []));
    if (rule.movieMaxRuntime !== undefined) {
      movieMaxRuntime = Math.min(
        movieMaxRuntime ?? Infinity,
        rule.movieMaxRuntime,
      );
    }
    if (rule.seriesMaxEpisodes !== undefined) {
      seriesMaxEpisodes = Math.min(
        seriesMaxEpisodes ?? Infinity,
        rule.seriesMaxEpisodes,
      );
    }
  }

  return {
    blockedGenreIds,
    blockedKeywordIds,
    movieMaxRuntime,
    seriesMaxEpisodes,
  };
};
