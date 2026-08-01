import { Injectable, Logger } from '@nestjs/common';
import {
  FeedCandidate,
  FeedCandidateSource,
  FeedContext,
} from '@/feed/types/feed.types';
import { MovieService } from '@/movie/movie.service';
import { SeriesService } from '@/series/series.service';
import { TmdbService } from '@/tmdb/tmdb.service';
import { SortOption } from '@/common/types/media-query';
import { QueryParamsDto } from '@/movie/dto/movie.dto';
import { MediaType } from '@/types/media-type';
import {
  TMDB_DiscoveredMovieDetail,
  TMDB_DiscoveredSeriesDetail,
  TMDB_DiscoverMovieQuery,
  TMDB_DiscoverSeriesQuery,
  TMDB_Recommendations,
} from '@/tmdb/tmdb.type';
import {
  CRITICS_CHOICE_MIN_RATING,
  DISCOVER_PAGES_PER_BUILD,
  MAX_SIMILAR_SOURCES,
  POPULAR_VOTE_COUNT_FLOOR,
  VOTE_COUNT_FLOOR,
  VOTE_COUNT_FOR_FULL_CONFIDENCE,
} from '@/feed/constants/feed.constant';
import { Cacheable } from '@/cache/cacheable.decorator';
import { CacheService } from '@/cache/cache.service';
import { Duration } from '@/common/app.constants';
import { movieRuntimeParams } from '@/feed/utils/movie-runtime';
import {
  CLASSIC_MAX_YEAR,
  ERA,
  MODERN_MIN_YEAR,
  AUTHORITY,
} from '@/taste/constants/journey.constant';

type DiscoveredDetail =
  | TMDB_DiscoveredMovieDetail
  | TMDB_DiscoveredSeriesDetail;

type DiscoverParams = TMDB_DiscoverMovieQuery & TMDB_DiscoverSeriesQuery;

/** One discover call: which genres to ask for, how to sort, what else to add. */
type TasteQuery = {
  genreIds: number[];
  sort?: SortOption;
  extraParams?: DiscoverParams;
};

/**
 * Fetches feed candidates from TMDB. Three sources always run together —
 * taste discovery, titles similar to the ones they like, and popular titles — and the
 * batch builder mixes them by share, so no single source owns the feed.
 */
@Injectable()
export class TitleFinderService {
  private readonly logger = new Logger(TitleFinderService.name);

  constructor(
    private readonly movieService: MovieService,
    private readonly seriesService: SeriesService,
    private readonly tmdbService: TmdbService,
    // Read by @Cacheable, so it can't be private.
    readonly cacheService: CacheService,
  ) {}

  async find(context: FeedContext): Promise<FeedCandidate[]> {
    const [discovered, similar, popular] = await Promise.all([
      this.discoverByTaste(context),
      this.findSimilar(context),
      this.findPopular(context),
    ]);

    return this.withoutTooLongSeries(
      [...discovered, ...similar, ...popular],
      context,
    );
  }

  /**
   * TMDB discover can't filter on episode count, so the "long watches" cap for
   * series is checked here — one cached lookup per candidate, and only when the
   * user picked that chip.
   */
  private async withoutTooLongSeries(
    candidates: FeedCandidate[],
    context: FeedContext,
  ): Promise<FeedCandidate[]> {
    const cap = context.avoid.seriesMaxEpisodes;
    if (cap === null || context.mediaType !== 'series') return candidates;

    const checked = await Promise.all(
      candidates.map(async (candidate) => {
        try {
          const episodes = await this.tmdbService.getSeriesEpisodeCount(
            candidate.id,
          );
          return episodes > cap ? null : candidate;
        } catch {
          this.logger.warn(
            `Failed to read the episode count for series/${candidate.id}; keeping it`,
          );
          return candidate;
        }
      }),
    );

    return checked.filter((candidate) => candidate !== null);
  }

  private async discoverByTaste(
    context: FeedContext,
  ): Promise<FeedCandidate[]> {
    const queries = this.tasteQueries(context);

    // The shared page counter is split across the queries: each call picks
    // the next query in rotation, and every query walks its own TMDB pages
    // 1, 2, 3… without gaps.
    const batches = await Promise.all(
      Array.from({ length: DISCOVER_PAGES_PER_BUILD }, (_, offset) => {
        const counter = context.nextTmdbPageToFetch - 1 + offset;
        const query = queries[counter % queries.length];
        const page = Math.floor(counter / queries.length) + 1;
        return this.discoverByQuery(query, page, context);
      }),
    );

    return batches.flat().map((item) => this.toCandidate(item, 'taste'));
  }

  /**
   * One discover query per answered question. Nothing here narrows by the
   * user's own titles — that is the similar source's job — so a user who
   * answered "no preference" everywhere gets one broad query and leans on the
   * other two sources.
   */
  private tasteQueries(context: FeedContext): TasteQuery[] {
    const { mediaType, taste } = context;
    const dateField =
      mediaType === 'movie' ? 'primary_release_date' : 'first_air_date';

    const queries: TasteQuery[] = [{ genreIds: [] }];

    if (taste.era === ERA.CLASSIC) {
      queries.push({
        genreIds: [],
        extraParams: { [`${dateField}.lte`]: `${CLASSIC_MAX_YEAR}-12-31` },
      });
    }
    if (taste.era === ERA.NEW_RELEASE) {
      queries.push({
        genreIds: [],
        extraParams: { [`${dateField}.gte`]: `${MODERN_MIN_YEAR}-01-01` },
      });
    }

    if (taste.authority === AUTHORITY.POPULAR) {
      queries.push({ genreIds: [], sort: SortOption.POPULARITY });
    }
    if (taste.authority === AUTHORITY.CRITICS_CHOICE) {
      queries.push({
        genreIds: [],
        extraParams: {
          'vote_average.gte': CRITICS_CHOICE_MIN_RATING,
          'vote_count.gte': VOTE_COUNT_FOR_FULL_CONFIDENCE,
        },
      });
    }

    return queries;
  }

  private discoverByQuery(
    tasteQuery: TasteQuery,
    page: number,
    context: FeedContext,
  ): Promise<DiscoveredDetail[]> {
    return this.discoverPage(context, {
      page,
      sort: tasteQuery.sort ?? SortOption.RANDOM,
      genreIds: tasteQuery.genreIds,
      // extraParams last: a query's own floor beats the shared one. Floors the
      // sort itself brings (POPULARITY adds rating and vote minimums further
      // down) still win over both.
      extraParams: {
        'vote_count.gte': VOTE_COUNT_FLOOR,
        ...tasteQuery.extraParams,
      },
    });
  }

  /** The always-on popular source; the mix gives it its own feed share. */
  private async findPopular(context: FeedContext): Promise<FeedCandidate[]> {
    // Discover paging advances in steps of DISCOVER_PAGES_PER_BUILD; popular
    // fetches one page per batch, so it walks pages 1, 2, 3… without gaps.
    const page = Math.ceil(
      context.nextTmdbPageToFetch / DISCOVER_PAGES_PER_BUILD,
    );

    const results = await this.discoverPage(context, {
      page,
      sort: SortOption.POPULARITY,
      extraParams: { 'vote_count.gte': POPULAR_VOTE_COUNT_FLOOR },
    });

    return results.map((item) => this.toCandidate(item, 'popular'));
  }

  private async discoverPage(
    context: FeedContext,
    options: {
      page: number;
      sort: SortOption;
      genreIds?: number[];
      extraParams: DiscoverParams;
    },
  ): Promise<DiscoveredDetail[]> {
    const query = {
      sort: options.sort,
      genres: options.genreIds?.length ? options.genreIds.join(',') : undefined,
      page: options.page,
    } as QueryParamsDto;

    // Series carry no length data at discover time, so the window is movies only.
    const runtime =
      context.mediaType === 'movie'
        ? movieRuntimeParams(context.avoid.movieMaxRuntime)
        : {};

    const params = {
      ...this.avoidParams(context),
      ...runtime,
      ...options.extraParams,
    };

    const res =
      context.mediaType === 'movie'
        ? await this.movieService.getDiscoveredMovies(query, params)
        : await this.seriesService.getDiscoveredSeries(query, params);
    return res.results;
  }

  /** Discover-time exclusions from the avoid chips. */
  private avoidParams(context: FeedContext): DiscoverParams {
    const { blockedGenreIds, blockedKeywordIds } = context.avoid;
    return {
      ...(blockedGenreIds.size && {
        without_genres: [...blockedGenreIds].join(','),
      }),
      ...(blockedKeywordIds.length && {
        without_keywords: blockedKeywordIds.join(','),
      }),
    };
  }

  // The page walks with the discover counter, so later rounds bring new titles
  // rather than the same first page again.
  private async findSimilar(context: FeedContext): Promise<FeedCandidate[]> {
    const sourceIds = context.likedTitles
      .slice(0, MAX_SIMILAR_SOURCES)
      .map((title) => title.id);

    const page = Math.ceil(
      context.nextTmdbPageToFetch / DISCOVER_PAGES_PER_BUILD,
    );

    const lists = await Promise.all(
      sourceIds.map((id) =>
        this.recommendationsFor(context.mediaType, id, page),
      ),
    );
    return this.withoutAvoidedKeywords(lists.flat(), context);
  }

  // Cached on the ids themselves: the answer never changes between feed pages,
  // and two users who disliked the same titles share it.
  @Cacheable({
    key: (mediaType: MediaType, dislikedIds: number[]) =>
      `feed-close-to-disliked-${mediaType}-${dislikedIds.join('-')}`,
    ttl: Duration.ONE_DAY,
  })
  async findCloseToDisliked(
    mediaType: MediaType,
    dislikedIds: number[],
  ): Promise<number[]> {
    const lists = await Promise.all(
      dislikedIds.map((id) => this.recommendationsFor(mediaType, id, 1)),
    );
    return [...new Set(lists.flat().map((candidate) => candidate.id))];
  }

  /**
   * The recommendations endpoint takes no filters, so avoided keywords have to
   * be checked here — one cached TMDB call per candidate. A title whose
   * keywords can't be read is dropped, because an avoid is a hard rule.
   */
  private async withoutAvoidedKeywords(
    candidates: FeedCandidate[],
    context: FeedContext,
  ): Promise<FeedCandidate[]> {
    const blocked = new Set(context.avoid.blockedKeywordIds);
    if (blocked.size === 0) return candidates;

    const checked = await Promise.all(
      candidates.map(async (candidate) => {
        try {
          const keywordIds = await this.tmdbService.getKeywordIds(
            context.mediaType,
            candidate.id,
          );
          return keywordIds.some((id) => blocked.has(id)) ? null : candidate;
        } catch {
          this.logger.warn(
            `Failed to read keywords for ${context.mediaType}/${candidate.id}; dropping it`,
          );
          return null;
        }
      }),
    );

    return checked.filter((candidate) => candidate !== null);
  }

  private async recommendationsFor(
    mediaType: MediaType,
    id: number,
    page: number,
  ): Promise<FeedCandidate[]> {
    try {
      const res = await this.tmdbService.getRecommendations<
        TMDB_Recommendations<DiscoveredDetail>
      >(mediaType, id, page);
      return res.results.map((item) => this.toCandidate(item, 'similar'));
    } catch {
      this.logger.warn(
        `Failed to fetch recommendations for ${mediaType}/${id}; skipping`,
      );
      return [];
    }
  }

  private toCandidate(
    item: DiscoveredDetail,
    source: FeedCandidateSource,
  ): FeedCandidate {
    return {
      id: item.id,
      genreIds: item.genre_ids ?? [],
      voteAverage: item.vote_average ?? 0,
      voteCount: item.vote_count ?? 0,
      popularity: item.popularity ?? 0,
      releaseYear: this.releaseYearOf(item),
      source,
    };
  }

  private releaseYearOf(item: DiscoveredDetail): number | null {
    const date =
      'release_date' in item ? item.release_date : item.first_air_date;
    const year = Number(date?.slice(0, 4));
    return Number.isFinite(year) && year > 0 ? year : null;
  }
}
