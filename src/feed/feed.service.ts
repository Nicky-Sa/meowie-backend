import { Injectable } from '@nestjs/common';
import { CacheService } from '@/cache/cache.service';
import { TasteService } from '@/taste/taste.service';
import { MovieService } from '@/movie/movie.service';
import { SeriesService } from '@/series/series.service';
import { ProfileBuilder } from '@/feed/profile/profile.builder';
import { EngineService } from '@/feed/engine/engine.service';
import { FeedContext } from '@/feed/engine/engine.types';
import { FeedProfile } from '@/feed/profile/profile.types';
import { MediaType } from '@/types/media-type';
import { SortOption } from '@/common/types/media-query';
import { FeedResDto } from '@/feed/dto/feed.dto';
import { FlexibilityOptionId } from '@/taste/constants/flexibility-options.constant';
import { Cacheable } from '@/cache/cacheable.decorator';
import { Duration } from '@/common/app.constants';
import {
  DISCOVER_PAGES_PER_BUILD,
  FEED_PAGE_SIZE,
  MAX_POOL_SIZE,
  POOL_TTL,
  SERVED_TTL,
  STATE_TTL,
} from '@/feed/feed.constants';

/** Per-request personalization inputs, shared by every batch the engine builds. */
type FeedInputs = {
  userId: number;
  mediaType: MediaType;
  profile: FeedProfile;
  flexibility: FlexibilityOptionId;
  excludeIds: Set<number>;
};

/** The cached, evolving feed state for one user+mediaType. */
type FeedState = {
  pool: number[];
  nextTmdbPageToFetch: number;
  shuffleSeed: number;
  served: Set<number>;
};

type FeedCacheKeys = {
  pool: string;
  nextTmdbPageToFetch: string;
  shuffleSeed: string;
  served: string;
};

@Injectable()
export class FeedService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly tasteService: TasteService,
    private readonly movieService: MovieService,
    private readonly seriesService: SeriesService,
    private readonly profileBuilder: ProfileBuilder,
    private readonly engineService: EngineService,
  ) {}

  /**
   * One page of the home feed.
   * Guests, and logged-in users with no taste or library get the public popular feed.
   * Otherwise, the page is sliced from a cached, ranked pool (excluding their library and anything already shown),
   * topping the pool up as they scroll. `refresh` re-rolls the order.
   */
  async getFeed(
    userId: number | null,
    mediaType: MediaType,
    page: number,
    refresh: boolean,
  ): Promise<FeedResDto> {
    if (userId === null) {
      return this.guestFeed(mediaType, page);
    }

    // Cold start: no taste and nothing in the library for this media type.
    const inputs = await this.resolveInputs(userId, mediaType);
    if (!inputs) {
      return this.guestFeed(mediaType, page);
    }

    const keys = this.cacheKeys(userId, mediaType);
    const state = await this.loadState(keys);

    if (refresh) {
      // Drop the pool and re-roll the shuffle; keep paging + served so a refresh
      // reaches for genuinely new titles first.
      state.pool = [];
      state.shuffleSeed = this.randomShuffleSeed();
    }

    const needed = page * FEED_PAGE_SIZE;
    await this.buildPool(inputs, state, needed);

    // Nothing personalized to show at all → public feed (never return empty).
    if (state.pool.length === 0) {
      return this.guestFeed(mediaType, page);
    }

    await this.saveState(keys, state);
    return this.toPage(state.pool, page, needed);
  }

  /**
   * Resolves the personalization inputs for a user, or `null` when there's
   * nothing to personalize from (no taste and an empty library for this media
   * type) — the caller falls back to the public feed.
   */
  private async resolveInputs(
    userId: number,
    mediaType: MediaType,
  ): Promise<FeedInputs | null> {
    const [profile, taste] = await Promise.all([
      this.profileBuilder.build(userId),
      this.tasteService.getResolvedTaste(userId),
    ]);

    const libraryIds =
      mediaType === 'movie'
        ? profile.libraryMovieIds
        : profile.librarySeriesIds;

    const canPersonalize =
      profile.keywordIds.length > 0 ||
      profile.genreIds.length > 0 ||
      libraryIds.length > 0;
    if (!canPersonalize) {
      return null;
    }

    return {
      userId,
      mediaType,
      profile,
      flexibility: taste.flexibility,
      excludeIds: new Set(libraryIds.map((item) => item.id)),
    };
  }

  /** Tops the pool up to `needed`, restarting once from page 1 if the catalog runs dry. */
  private async buildPool(
    inputs: FeedInputs,
    state: FeedState,
    needed: number,
  ): Promise<void> {
    await this.extendPool(inputs, state, needed);

    // Suppression exhausted the catalog → restart from page 1. The shuffle seed
    // reorders the same titles, so a refresh still looks different.
    if (state.pool.length === 0) {
      state.served.clear();
      state.nextTmdbPageToFetch = 1;
      await this.extendPool(inputs, state, needed);
    }
  }

  /**
   * Appends fresh ranked ids to the pool until it holds at least `needed` (or a
   * source runs dry), advancing `nextTmdbPageToFetch` each round. Skips ids
   * already pooled. Mutates `state`.
   */
  private async extendPool(
    inputs: FeedInputs,
    state: FeedState,
    needed: number,
  ): Promise<void> {
    while (state.pool.length < needed && state.pool.length < MAX_POOL_SIZE) {
      const context: FeedContext = {
        ...inputs,
        served: state.served,
        shuffleSeed: state.shuffleSeed,
        nextTmdbPageToFetch: state.nextTmdbPageToFetch,
      };

      const fresh = await this.engineService.buildBatch(context);
      state.nextTmdbPageToFetch += DISCOVER_PAGES_PER_BUILD;

      if (fresh.length === 0) break; // sources exhausted

      // The engine filters against `served`/`excludeIds`, but a fallback can
      // resurface a candidate across consecutive batches — guard the pool too.
      const poolSet = new Set(state.pool);
      const trulyFresh = fresh.filter((id) => !poolSet.has(id));

      if (trulyFresh.length === 0) break;

      state.pool.push(...trulyFresh);
      trulyFresh.forEach((id) => state.served.add(id));
    }
  }

  /** Slices the ranked pool into the requested page. */
  private toPage(pool: number[], page: number, needed: number): FeedResDto {
    const start = (page - 1) * FEED_PAGE_SIZE;
    const results = pool.slice(start, start + FEED_PAGE_SIZE);
    const exhausted = pool.length < needed;

    return {
      page,
      results,
      total_pages: exhausted ? page : page + 1,
      total_results: pool.length,
    };
  }

  private async loadState(keys: FeedCacheKeys): Promise<FeedState> {
    const [pool, nextTmdbPageToFetch, shuffleSeed, served] = await Promise.all([
      this.cacheService.get<number[]>(keys.pool),
      this.cacheService.get<number>(keys.nextTmdbPageToFetch),
      this.cacheService.get<number>(keys.shuffleSeed),
      this.cacheService.get<number[]>(keys.served),
    ]);

    return {
      pool: pool ?? [],
      nextTmdbPageToFetch: nextTmdbPageToFetch ?? 1,
      shuffleSeed: shuffleSeed ?? this.randomShuffleSeed(),
      served: new Set(served ?? []),
    };
  }

  private async saveState(
    keys: FeedCacheKeys,
    state: FeedState,
  ): Promise<void> {
    await Promise.all([
      this.cacheService.set(keys.pool, state.pool, POOL_TTL),
      this.cacheService.set(
        keys.nextTmdbPageToFetch,
        state.nextTmdbPageToFetch,
        STATE_TTL,
      ),
      this.cacheService.set(keys.shuffleSeed, state.shuffleSeed, STATE_TTL),
      this.cacheService.set(keys.served, [...state.served], SERVED_TTL),
    ]);
  }

  /** The public, non-personalized feed (popular titles) — for guests and cold starts. */
  @Cacheable({
    key: (mediaType: MediaType, page: number) =>
      `feed-guest-${mediaType}-p${page}`,
    ttl: Duration.ONE_HOUR,
  })
  private async guestFeed(
    mediaType: MediaType,
    page: number,
  ): Promise<FeedResDto> {
    const res =
      mediaType === 'movie'
        ? await this.movieService.getInterestingMovieIds({
            page,
            sort: SortOption.POPULARITY,
          })
        : await this.seriesService.getInterestingSeriesIds({
            page,
            sort: SortOption.POPULARITY,
          });

    return {
      page: res.page,
      results: res.results,
      total_pages: res.total_pages,
      total_results: res.total_results,
    };
  }

  /** Redis keys holding this user's feed state: the pool, paging, shuffle, and served set. */
  private cacheKeys(userId: number, mediaType: MediaType): FeedCacheKeys {
    const base = `feed:${userId}:${mediaType}`;
    return {
      pool: `${base}:pool`,
      nextTmdbPageToFetch: `${base}:next-discover-page`, // Intentionally keeping the redis key string the same to not invalidate existing caches
      shuffleSeed: `${base}:shuffle-seed`,
      served: `${base}:served`,
    };
  }

  /** A new random seed; changing it reshuffles the ranked order on refresh. */
  private randomShuffleSeed(): number {
    return Math.floor(Math.random() * 1_000_000);
  }
}
