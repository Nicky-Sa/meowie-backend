import { Injectable } from '@nestjs/common';
import { CacheService } from '@/cache/cache.service';
import { TasteService } from '@/taste/taste.service';
import { LibraryService } from '@/library/library.service';
import { MovieService } from '@/movie/movie.service';
import { SeriesService } from '@/series/series.service';
import { BatchBuilderService } from '@/feed/batch-builder.service';
import { FeedContext, FeedInputs } from '@/feed/types/feed.types';
import { MediaType } from '@/types/media-type';
import { SortOption } from '@/common/types/media-query';
import { FeedResDto } from '@/feed/dto/feed.dto';
import { buildAvoidRules } from '@/feed/constants/avoid.constant';
import { knownTitlesFor } from '@/feed/utils/known-titles';
import { Cacheable } from '@/cache/cacheable.decorator';
import { Duration } from '@/common/app.constants';
import {
  DISCOVER_PAGES_PER_BUILD,
  FEED_PAGE_SIZE,
  FeedCacheKeys,
  feedCacheKeys,
  MAX_FEED_PAGE,
  MAX_POOL_SIZE,
  SHOWN_TTL,
  STATE_TTL,
} from '@/feed/constants/feed.constant';

/** What sits in Redis under the state key. */
type SavedFeedState = {
  pool: number[];
  nextTmdbPageToFetch: number;
  shuffleSeed: number;
};

/** The evolving feed state for one user + media type. */
type FeedState = SavedFeedState & {
  alreadyShown: Set<number>;
};

@Injectable()
export class FeedService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly tasteService: TasteService,
    private readonly libraryService: LibraryService,
    private readonly movieService: MovieService,
    private readonly seriesService: SeriesService,
    private readonly batchBuilderService: BatchBuilderService,
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
    const inputs = await this.buildInputs(userId, mediaType);
    if (!inputs) {
      return this.guestFeed(mediaType, page);
    }

    const keys = feedCacheKeys(userId, mediaType);
    const state = await this.loadState(keys);

    // A refresh drops the pool and re-rolls the shuffle. The titles it drops
    // are skipped for this build only, so it reaches for new ones first
    // without hiding them for good.
    const droppedOnRefresh = new Set(refresh ? state.pool : []);
    if (refresh) {
      state.pool = [];
      state.shuffleSeed = this.randomShuffleSeed();
    }

    // One page further than asked, so "is there another page" is answered by a
    // pool that was actually told to hold one.
    const needed = Math.min((page + 1) * FEED_PAGE_SIZE, MAX_POOL_SIZE);
    await this.buildPool(inputs, state, needed, droppedOnRefresh);

    // Nothing personalized to show at all → public feed (never return empty).
    if (state.pool.length === 0) {
      await this.saveState(keys, state);
      return this.guestFeed(mediaType, page);
    }

    const feedPage = this.toPage(state.pool, page);
    feedPage.results.forEach((id) => state.alreadyShown.add(id));
    await this.saveState(keys, state);
    return feedPage;
  }

  /**
   * Everything the feed personalizes with for a user, or `null` when there's
   * nothing to work with (no taste and an empty library for this media type) —
   * the caller falls back to the public feed.
   */
  private async buildInputs(
    userId: number,
    mediaType: MediaType,
  ): Promise<FeedInputs | null> {
    const [taste, libraryItems] = await Promise.all([
      this.tasteService.getTasteForFeed(userId),
      this.libraryService.getItemsForUser(userId, mediaType),
    ]);

    const knownTitles = knownTitlesFor(taste, libraryItems, mediaType);
    if (taste.genreIds.length === 0 && knownTitles.length === 0) {
      return null;
    }

    return {
      mediaType,
      taste,
      avoid: buildAvoidRules(taste.avoid),
      excludeIds: new Set(knownTitles.map((title) => title.id)),
      likedTitles: knownTitles
        .filter((title) => title.weight > 0)
        .sort((first, second) => second.weight - first.weight),
    };
  }

  /** Tops the pool up to `needed`, restarting once from page 1 if the catalog runs dry. */
  private async buildPool(
    inputs: FeedInputs,
    state: FeedState,
    needed: number,
    droppedOnRefresh: Set<number>,
  ): Promise<void> {
    await this.extendPool(inputs, state, needed, droppedOnRefresh);

    // Filtering used up the whole catalog → start again from page 1. The
    // shuffle seed reorders the same titles, so a refresh still looks different.
    if (state.pool.length === 0) {
      state.alreadyShown.clear();
      state.nextTmdbPageToFetch = 1;
      await this.extendPool(inputs, state, needed, droppedOnRefresh);
    }
  }

  /**
   * Appends fresh ranked ids to the pool until it holds at least `needed` (or a
   * source runs dry), advancing `nextTmdbPageToFetch` each round. Mutates `state`.
   */
  private async extendPool(
    inputs: FeedInputs,
    state: FeedState,
    needed: number,
    droppedOnRefresh: Set<number>,
  ): Promise<void> {
    const hiddenIds = new Set([...state.alreadyShown, ...droppedOnRefresh]);

    while (state.pool.length < needed && state.pool.length < MAX_POOL_SIZE) {
      const context: FeedContext = {
        ...inputs,
        hiddenIds,
        // Similar titles don't paginate, so they only come with the first round —
        // which is also the round right after a refresh.
        includeSimilar: state.pool.length === 0,
        shuffleSeed: state.shuffleSeed,
        nextTmdbPageToFetch: state.nextTmdbPageToFetch,
      };

      const fresh = await this.batchBuilderService.build(context);
      state.nextTmdbPageToFetch += DISCOVER_PAGES_PER_BUILD;

      if (fresh.length === 0) break;

      // The engine filters against `hiddenIds`/`excludeIds`, but a fallback can
      // resurface a candidate across consecutive batches — guard the pool too.
      const poolSet = new Set(state.pool);
      const trulyFresh = fresh.filter((id) => !poolSet.has(id));

      if (trulyFresh.length === 0) break;

      // Trimmed, not just stopped at: a batch can overshoot the cap, and a pool
      // past it would promise a page the request DTO refuses to serve.
      state.pool = [...state.pool, ...trulyFresh].slice(0, MAX_POOL_SIZE);
    }
  }

  /** Slices the ranked pool into the requested page. */
  private toPage(pool: number[], page: number): FeedResDto {
    const start = (page - 1) * FEED_PAGE_SIZE;
    const results = pool.slice(start, start + FEED_PAGE_SIZE);

    return {
      page,
      results,
      total_pages: pool.length > start + FEED_PAGE_SIZE ? page + 1 : page,
      total_results: pool.length,
    };
  }

  private async loadState(keys: FeedCacheKeys): Promise<FeedState> {
    const [saved, alreadyShown] = await Promise.all([
      this.cacheService.get<SavedFeedState>(keys.state),
      this.cacheService.get<number[]>(keys.alreadyShown),
    ]);

    return {
      pool: saved?.pool ?? [],
      nextTmdbPageToFetch: saved?.nextTmdbPageToFetch ?? 1,
      shuffleSeed: saved?.shuffleSeed ?? this.randomShuffleSeed(),
      alreadyShown: new Set(alreadyShown ?? []),
    };
  }

  private async saveState(
    keys: FeedCacheKeys,
    state: FeedState,
  ): Promise<void> {
    const { pool, nextTmdbPageToFetch, shuffleSeed, alreadyShown } = state;

    await Promise.all([
      this.cacheService.set(
        keys.state,
        { pool, nextTmdbPageToFetch, shuffleSeed },
        STATE_TTL,
      ),
      this.cacheService.set(keys.alreadyShown, [...alreadyShown], SHOWN_TTL),
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
    const query = { page, sort: SortOption.POPULARITY };
    const res =
      mediaType === 'movie'
        ? await this.movieService.getInterestingMovieIds(query)
        : await this.seriesService.getInterestingSeriesIds(query);

    return {
      page: res.page,
      results: res.results,
      // Held to the same last page as the personalized feed, so a client
      // never asks for a page the personalized side would reject.
      total_pages: Math.min(res.total_pages, MAX_FEED_PAGE),
      total_results: res.total_results,
    };
  }

  /** A new random seed; changing it reshuffles the ranked order on refresh. */
  private randomShuffleSeed(): number {
    return Math.floor(Math.random() * 1_000_000);
  }
}
