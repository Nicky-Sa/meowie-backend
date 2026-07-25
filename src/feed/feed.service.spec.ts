import { beforeEach, describe, expect, it } from '@jest/globals';
import { FeedService } from '@/feed/feed.service';
import { CacheService } from '@/cache/cache.service';
import { TasteService } from '@/taste/taste.service';
import { LibraryService } from '@/library/library.service';
import { MovieService } from '@/movie/movie.service';
import { SeriesService } from '@/series/series.service';
import { BatchBuilderService } from '@/feed/batch-builder.service';
import { FeedContext } from '@/feed/types/feed.types';
import { feedCacheKeys, MAX_FEED_PAGE } from '@/feed/constants/feed.constant';

const USER_ID = 7;
const keys = feedCacheKeys(USER_ID, 'movie');

class FakeCache {
  readonly values = new Map<string, unknown>();

  set(key: string, value: unknown): Promise<void> {
    this.values.set(key, value);
    return Promise.resolve();
  }

  get<T>(key: string): Promise<T | null> {
    return Promise.resolve((this.values.get(key) as T) ?? null);
  }

  del(key: string): Promise<void> {
    this.values.delete(key);
    return Promise.resolve();
  }
}

const taste = {
  getTasteForFeed: () =>
    Promise.resolve({
      genreIds: [18],
      movieIds: [],
      seriesIds: [],
      avoid: [],
      exploreLevel: 2,
      era: 'both',
      reality: 'both',
      authority: 'both',
      commitment: 'both',
    }),
} as unknown as TasteService;

const libraryService = {
  getItemsForUser: () => Promise.resolve([]),
} as unknown as LibraryService;

const guestResponse = {
  page: 1,
  results: [900, 901],
  total_pages: 500,
  total_results: 10000,
};

const movieService = {
  getInterestingMovieIds: () => Promise.resolve(guestResponse),
} as unknown as MovieService;

const seriesService = {} as unknown as SeriesService;

/** Hands out one scripted batch per call, so a build can be driven round by round. */
const builderReturning = (...batches: number[][]) => {
  const seen: FeedContext[] = [];
  let round = 0;
  const batchBuilder = {
    build: (context: FeedContext) => {
      seen.push(context);
      const batch = batches[round] ?? [];
      round += 1;
      return Promise.resolve(batch);
    },
  } as unknown as BatchBuilderService;
  return { batchBuilder, seen };
};

const ids = (fromId: number, count: number): number[] =>
  Array.from({ length: count }, (_, offset) => fromId + offset);

const serviceWith = (batchBuilder: BatchBuilderService, cache: FakeCache) =>
  new FeedService(
    cache as unknown as CacheService,
    taste,
    libraryService,
    movieService,
    seriesService,
    batchBuilder,
  );

describe('FeedService paging', () => {
  let cache: FakeCache;

  beforeEach(() => {
    cache = new FakeCache();
  });

  it('promises another page only when the pool holds one', async () => {
    const { batchBuilder } = builderReturning(ids(1, 40), []);
    const service = serviceWith(batchBuilder, cache);

    const first = await service.getFeed(USER_ID, 'movie', 1, false);

    expect(first.results).toHaveLength(20);
    expect(first.total_pages).toBe(2);
  });

  it('does not promise a page it cannot fill', async () => {
    const { batchBuilder } = builderReturning(ids(1, 20), []);
    const service = serviceWith(batchBuilder, cache);

    const page = await service.getFeed(USER_ID, 'movie', 1, false);

    expect(page.results).toHaveLength(20);
    expect(page.total_pages).toBe(1);
  });

  it('never returns an empty page while promising more', async () => {
    const { batchBuilder } = builderReturning(ids(1, 40), []);
    const service = serviceWith(batchBuilder, cache);

    const first = await service.getFeed(USER_ID, 'movie', 1, false);
    const last = await service.getFeed(
      USER_ID,
      'movie',
      first.total_pages,
      false,
    );

    expect(last.results.length).toBeGreaterThan(0);
    expect(last.total_pages).toBe(last.page);
  });

  // A batch of exactly 80 is the plain no-filtering case, and it used to end
  // the feed there because the pool landed on a page boundary.
  it('keeps going when a batch lands exactly on a page boundary', async () => {
    const { batchBuilder } = builderReturning(ids(1, 80), ids(81, 80), []);
    const service = serviceWith(batchBuilder, cache);

    const fourth = await service.getFeed(USER_ID, 'movie', 4, false);

    expect(fourth.results).toHaveLength(20);
    expect(fourth.total_pages).toBe(5);
  });

  it('never promises a page past the last one the endpoint accepts', async () => {
    const { batchBuilder } = builderReturning(ids(1, 600), []);
    const service = serviceWith(batchBuilder, cache);

    const last = await service.getFeed(USER_ID, 'movie', MAX_FEED_PAGE, false);

    expect(last.results).toHaveLength(20);
    expect(last.total_pages).toBe(MAX_FEED_PAGE);
  });

  it('holds the guest feed to the same last page', async () => {
    const { batchBuilder } = builderReturning([], []);
    const service = serviceWith(batchBuilder, cache);

    const page = await service.getFeed(USER_ID, 'movie', 1, false);

    expect(page.total_pages).toBe(MAX_FEED_PAGE);
  });
});

describe('FeedService remembers what it showed', () => {
  let cache: FakeCache;

  beforeEach(() => {
    cache = new FakeCache();
  });

  it('stores the shown ids, not the whole pool', async () => {
    const { batchBuilder } = builderReturning(ids(1, 40), []);
    const service = serviceWith(batchBuilder, cache);

    const page = await service.getFeed(USER_ID, 'movie', 1, false);

    expect(cache.values.get(keys.alreadyShown)).toEqual(page.results);
  });

  it('keeps titles a refresh dropped available for later', async () => {
    const { batchBuilder, seen } = builderReturning(
      ids(1, 40),
      ids(41, 40),
      [],
    );
    const service = serviceWith(batchBuilder, cache);

    const first = await service.getFeed(USER_ID, 'movie', 1, false);
    await service.getFeed(USER_ID, 'movie', 1, true);

    const hiddenAfterRefresh = seen[1].hiddenIds;
    const pooledButNotShown = 40;
    expect(hiddenAfterRefresh.has(first.results[0])).toBe(true);
    expect(cache.values.get(keys.alreadyShown)).not.toContain(
      pooledButNotShown,
    );
  });

  it('asks for similar titles again after a refresh', async () => {
    const { batchBuilder, seen } = builderReturning(
      ids(1, 40),
      ids(41, 40),
      [],
    );
    const service = serviceWith(batchBuilder, cache);

    await service.getFeed(USER_ID, 'movie', 1, false);
    await service.getFeed(USER_ID, 'movie', 1, true);

    expect(seen[0].includeSimilar).toBe(true);
    expect(seen[1].includeSimilar).toBe(true);
  });
});

describe('FeedService when the catalog runs dry', () => {
  it('saves the paging state instead of throwing it away', async () => {
    const cache = new FakeCache();
    const { batchBuilder } = builderReturning([], []);
    const service = serviceWith(batchBuilder, cache);

    const page = await service.getFeed(USER_ID, 'movie', 1, false);

    expect(page.results).toEqual(guestResponse.results);
    expect(cache.values.has(keys.state)).toBe(true);
  });
});
