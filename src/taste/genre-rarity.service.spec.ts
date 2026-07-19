import { describe, expect, it } from '@jest/globals';
import {
  GenreRarityService,
  MAX_RARITY_WEIGHT,
  MIN_RARITY_WEIGHT,
  weightsFromCounts,
} from '@/taste/genre-rarity.service';
import { RARITY_WEIGHTS } from '@/taste/constants/journey.constant';
import { TmdbService } from '@/tmdb/tmdb.service';
import { CacheService } from '@/cache/cache.service';

describe('weightsFromCounts', () => {
  it('weighs the middle genre 1 and scales inversely to frequency', () => {
    const weights = weightsFromCounts([
      { id: 1, count: 200 },
      { id: 2, count: 100 },
      { id: 3, count: 50 },
    ]);

    expect(weights).toEqual({ 1: 0.5, 2: 1, 3: 2 });
  });

  it('clamps runaway ratios to the bounds', () => {
    const weights = weightsFromCounts([
      { id: 1, count: 100_000 },
      { id: 2, count: 100 },
      { id: 3, count: 1 },
    ]);

    expect(weights[1]).toBe(MIN_RARITY_WEIGHT);
    expect(weights[3]).toBe(MAX_RARITY_WEIGHT);
  });

  it('treats an empty genre as maximally rare', () => {
    const weights = weightsFromCounts([
      { id: 1, count: 100 },
      { id: 2, count: 0 },
    ]);

    expect(weights[2]).toBe(MAX_RARITY_WEIGHT);
  });
});

type DiscoverCall = { mediaType: string; params: Record<string, unknown> };

type Stubs = {
  service: GenreRarityService;
  discoverCalls: () => DiscoverCall[];
  cached: Map<string, unknown>;
};

const serviceWith = (totalResults: () => Promise<number>): Stubs => {
  const calls: DiscoverCall[] = [];
  const tmdbService = {
    getDiscover: (mediaType: string, params: Record<string, unknown>) => {
      calls.push({ mediaType, params });
      return totalResults().then((total) => ({ total_results: total }));
    },
  } as unknown as TmdbService;

  const cached = new Map<string, unknown>();
  const cacheService = {
    get: (key: string) => Promise.resolve(cached.get(key)),
    set: (key: string, value: unknown) => {
      cached.set(key, value);
      return Promise.resolve();
    },
  } as unknown as CacheService;

  return {
    service: new GenreRarityService(tmdbService, cacheService),
    discoverCalls: () => calls,
    cached,
  };
};

describe('GenreRarityService', () => {
  it('computes weights from TMDB counts and caches them', async () => {
    const { service, discoverCalls, cached } = serviceWith(() =>
      Promise.resolve(100),
    );

    const weights = await service.getWeights();
    expect(Object.values(weights).every((weight) => weight === 1)).toBe(true);
    expect(cached.size).toBe(1);

    const callCount = discoverCalls().length;
    await service.getWeights();
    expect(discoverCalls().length).toBe(callCount);
  });

  it('counts movies above the vote floor', async () => {
    const { service, discoverCalls } = serviceWith(() => Promise.resolve(100));
    await service.getWeights();

    const firstCall = discoverCalls()[0];
    expect(firstCall.mediaType).toBe('movie');
    expect(firstCall.params['vote_count.gte']).toBe(50);
  });

  it('falls back to the static table when TMDB fails, without caching it', async () => {
    const { service, cached } = serviceWith(() =>
      Promise.reject(new Error('tmdb down')),
    );

    await expect(service.getWeights()).resolves.toEqual(RARITY_WEIGHTS);
    expect(cached.size).toBe(0);
  });

  it('keeps serving the fallback for a while instead of retrying at once', async () => {
    const { service, discoverCalls } = serviceWith(() =>
      Promise.reject(new Error('tmdb down')),
    );

    await service.getWeights();
    const callCountAfterFailure = discoverCalls().length;

    await expect(service.getWeights()).resolves.toEqual(RARITY_WEIGHTS);
    expect(discoverCalls().length).toBe(callCountAfterFailure);
  });
});
