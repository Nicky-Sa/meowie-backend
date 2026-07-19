import { Injectable, Logger } from '@nestjs/common';
import { TmdbService } from '@/tmdb/tmdb.service';
import { CacheService } from '@/cache/cache.service';
import { Cacheable } from '@/cache/cacheable.decorator';
import { Duration } from '@/common/app.constants';
import { TMDB_DiscoverMovieQuery } from '@/tmdb/tmdb.type';
import { GenreId } from '@/taste/constants/pools.constant';
import {
  GENRE_CHIPS,
  RARITY_WEIGHTS,
} from '@/taste/constants/journey.constant';

// Titles below this vote count barely surface in the app, so they don't count.
const MIN_VOTE_COUNT_FOR_CATALOG = 50;

// Bounds keep one giant or tiny genre from dwarfing the scale.
export const MIN_RARITY_WEIGHT = 0.5;
export const MAX_RARITY_WEIGHT = 2;

type GenreCount = { id: GenreId; count: number };

/**
 * Turns per-genre catalog sizes into rarity weights: the middle genre weighs
 * 1, rarer genres more, common ones less (inverse to frequency), clamped to
 * the bounds and rounded to two decimals.
 */
export const weightsFromCounts = (
  counts: GenreCount[],
): Record<GenreId, number> => {
  const sorted = [...counts].sort(
    (first, second) => first.count - second.count,
  );
  const middleCount = sorted[Math.floor(sorted.length / 2)]?.count ?? 0;

  const weights: Record<GenreId, number> = {};
  for (const { id, count } of counts) {
    const raw = count > 0 ? middleCount / count : MAX_RARITY_WEIGHT;
    const clamped = Math.min(
      Math.max(raw, MIN_RARITY_WEIGHT),
      MAX_RARITY_WEIGHT,
    );
    weights[id] = Math.round(clamped * 100) / 100;
  }
  return weights;
};

// After a TMDB failure the fallback keeps serving for this long, so the taste
// endpoints don't re-fire the whole fan-out (and pay its timeout) per request.
const HOLD_FALLBACK_AFTER_FAILURE_MS = Duration.FIVE_MINUTES * 1000;

/**
 * Rarity weight per genre chip, counted from the live TMDB catalog. Falls
 * back to the hand-tuned table when TMDB is unavailable, without caching the
 * fallback.
 */
@Injectable()
export class GenreRarityService {
  private readonly logger = new Logger(GenreRarityService.name);
  private inFlight: Promise<Record<GenreId, number>> | null = null;
  private failedAt: number | null = null;

  constructor(
    private readonly tmdbService: TmdbService,
    private readonly cacheService: CacheService,
  ) {}

  async getWeights(): Promise<Record<GenreId, number>> {
    if (
      this.failedAt !== null &&
      Date.now() - this.failedAt < HOLD_FALLBACK_AFTER_FAILURE_MS
    ) {
      return RARITY_WEIGHTS;
    }

    try {
      // Concurrent cache misses share one fan-out instead of 18 calls each.
      this.inFlight ??= this.weightsFromTmdb();
      const weights = await this.inFlight;
      this.failedAt = null;
      return weights;
    } catch (error) {
      this.failedAt = Date.now();
      this.logger.warn(
        `Counting genres on TMDB failed; using the fallback rarity weights: ${String(error)}`,
      );
      return RARITY_WEIGHTS;
    } finally {
      this.inFlight = null;
    }
  }

  @Cacheable({ key: () => 'genre-rarity-weights', ttl: Duration.ONE_WEEK })
  private async weightsFromTmdb(): Promise<Record<GenreId, number>> {
    const counts = await Promise.all(
      GENRE_CHIPS.map(async (chip) => ({
        id: chip.id,
        count: await this.genreTitleCount(chip.id),
      })),
    );
    return weightsFromCounts(counts);
  }

  // The chips are movie genre ids, so the movie catalog is what gets counted;
  // TV uses its own genre ids and would need a separate mapping.
  private async genreTitleCount(genreId: GenreId): Promise<number> {
    const response = await this.tmdbService.getDiscover<
      { total_results: number },
      TMDB_DiscoverMovieQuery
    >('movie', {
      with_genres: String(genreId),
      'vote_count.gte': MIN_VOTE_COUNT_FOR_CATALOG,
      page: 1,
    });
    return response.total_results;
  }
}
