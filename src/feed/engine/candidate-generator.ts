import { Injectable, Logger } from '@nestjs/common';
import {
  FeedContext,
  FeedCandidate,
  FeedCandidateSource,
} from '@/feed/engine/engine.types';
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
  LONG_MIN_RUNTIME,
  MAX_SIMILAR_SOURCES,
  MIN_MOVIE_RUNTIME,
  POPULAR_VOTE_COUNT_FLOOR,
  SHORT_MAX_RUNTIME,
  VOTE_COUNT_FLOOR,
  VOTE_COUNT_FOR_FULL_CONFIDENCE,
} from '@/feed/feed.constants';
import { tvGenreIdsFor } from '@/feed/movie-to-tv-genres.constant';
import { likedTitlesFor } from '@/feed/profile/profile.types';
import {
  CLASSIC_MAX_YEAR,
  COMMITMENT,
  ERA,
  ESCAPIST_GENRE_IDS,
  GROUNDED_GENRE_IDS,
  MODERN_MIN_YEAR,
  REALITY,
  TASTE_AUTHORITY,
} from '@/taste/constants/journey.constant';

type DiscoveredDetail =
  | TMDB_DiscoveredMovieDetail
  | TMDB_DiscoveredSeriesDetail;

type AvoidParams = {
  without_genres?: string;
  without_keywords?: string;
};

/**
 * One discover call shape: which genres to ask TMDB for, plus an optional
 * sort (random by default) and extra filters (date window, rating floor).
 * Params are typed for either media type; a query only ever carries the
 * fields of the media type it runs for.
 */
type TasteQuery = {
  genreIds: number[];
  sort?: SortOption;
  extraParams?: TMDB_DiscoverMovieQuery & TMDB_DiscoverSeriesQuery;
};

/**
 * The single candidate-generation stage: takes a context (profile + paging)
 * and turns it into catalog items via TMDB. Three sources always run
 * together — taste discovery, lookalikes of liked titles, and popular titles —
 * and the engine mixes them by share, so no single source owns the feed.
 */
@Injectable()
export class CandidateGenerator {
  private readonly logger = new Logger(CandidateGenerator.name);

  constructor(
    private readonly movieService: MovieService,
    private readonly seriesService: SeriesService,
    private readonly tmdbService: TmdbService,
  ) {}

  async generate(context: FeedContext): Promise<FeedCandidate[]> {
    const [discovered, recommended, popular] = await Promise.all([
      this.discoverByTaste(context),
      this.recommendFromLikedTitles(context),
      this.fetchPopular(context),
    ]);

    return [...discovered, ...recommended, ...popular];
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
        return this.discover(query, page, context);
      }),
    );

    return batches
      .flat()
      .map((item) => this.toCandidate(item, context.mediaType, 'taste'));
  }

  /**
   * One discover query per strong taste signal — candidates are fetched by
   * every dimension of taste, not only by genre. 'both' and unanswered
   * dimensions add no query.
   */
  private tasteQueries(context: FeedContext): TasteQuery[] {
    const { mediaType, profile, taste } = context;
    // Taste genres are movie genre ids; TV discovery needs its own genre
    // list (chips with no TV match don't limit series at all).
    const tasteGenreIds = profile.genreIds.map((genre) => genre.id);
    const genreIds =
      mediaType === 'movie' ? tasteGenreIds : tvGenreIdsFor(tasteGenreIds);
    const dateField =
      mediaType === 'movie' ? 'primary_release_date' : 'first_air_date';

    const queries: TasteQuery[] = [{ genreIds }];

    if (taste.era === ERA.CLASSIC) {
      queries.push({
        genreIds,
        extraParams: { [`${dateField}.lte`]: `${CLASSIC_MAX_YEAR}-12-31` },
      });
    }
    if (taste.era === ERA.NEW_RELEASE) {
      queries.push({
        genreIds,
        extraParams: { [`${dateField}.gte`]: `${MODERN_MIN_YEAR}-01-01` },
      });
    }

    // The reality lean searches its own genre families, deliberately beyond
    // the picked taste genres — the mix and the scorers keep it in balance.
    if (taste.reality === REALITY.REALISTIC) {
      queries.push({ genreIds: GROUNDED_GENRE_IDS });
    }
    if (taste.reality === REALITY.FANTASY) {
      queries.push({ genreIds: ESCAPIST_GENRE_IDS });
    }

    if (taste.tasteAuthority === TASTE_AUTHORITY.POPULAR) {
      queries.push({ genreIds, sort: SortOption.POPULARITY });
    }
    if (taste.tasteAuthority === TASTE_AUTHORITY.CRITICS_CHOICE) {
      queries.push({
        genreIds,
        extraParams: {
          'vote_average.gte': CRITICS_CHOICE_MIN_RATING,
          'vote_count.gte': VOTE_COUNT_FOR_FULL_CONFIDENCE,
        },
      });
    }

    return queries;
  }

  private async discover(
    tasteQuery: TasteQuery,
    page: number,
    context: FeedContext,
  ): Promise<DiscoveredDetail[]> {
    const query = {
      sort: tasteQuery.sort ?? SortOption.RANDOM,
      genres: tasteQuery.genreIds.length
        ? tasteQuery.genreIds.join(',')
        : undefined,
      page,
    } as QueryParamsDto;

    // extraParams last: a query's own floor beats the shared one. Floors the
    // sort itself brings (POPULARITY adds rating and vote minimums further
    // down) still win over both.
    if (context.mediaType === 'movie') {
      const res = await this.movieService.getDiscoveredMovies(query, {
        ...this.avoidParams(context),
        ...this.movieRuntimeParams(context),
        'vote_count.gte': VOTE_COUNT_FLOOR,
        ...tasteQuery.extraParams,
      });
      return res.results;
    }

    const res = await this.seriesService.getDiscoveredSeries(query, {
      ...this.avoidParams(context),
      'vote_count.gte': VOTE_COUNT_FLOOR,
      ...tasteQuery.extraParams,
    });
    return res.results;
  }

  /** Discover-time exclusions from the avoid chips. */
  private avoidParams(context: FeedContext): AvoidParams {
    const { genreIds, keywordIds } = context.avoid;
    return {
      ...(genreIds.size && { without_genres: [...genreIds].join(',') }),
      ...(keywordIds.length && { without_keywords: keywordIds.join(',') }),
    };
  }

  /**
   * Movie runtime window from the commitment answer and the "Very long
   * commitment" avoid cap. The cap wins over a 'long' preference — an avoid is
   * a harder signal than a lean. Series carry no length data at discover time.
   */
  private movieRuntimeParams(context: FeedContext): Record<string, number> {
    const cap = context.avoid.movieMaxRuntime;
    const { commitment } = context.taste;

    let min = MIN_MOVIE_RUNTIME;
    let max: number | null = null;

    if (commitment === COMMITMENT.SHORT) max = SHORT_MAX_RUNTIME;
    if (commitment === COMMITMENT.LONG) min = LONG_MIN_RUNTIME;
    if (cap !== null) {
      max = Math.min(max ?? cap, cap);
      min = Math.min(min, cap);
    }

    return {
      'with_runtime.gte': min,
      ...(max !== null && { 'with_runtime.lte': max }),
    };
  }

  private async recommendFromLikedTitles(
    context: FeedContext,
  ): Promise<FeedCandidate[]> {
    // Recommendations don't paginate alongside discover pages, so pull them once
    // on the first build batch — they cluster the lookalikes up top.
    if (context.nextTmdbPageToFetch !== 1) {
      return [];
    }

    const { mediaType, profile } = context;
    const sourceIds = likedTitlesFor(profile, mediaType)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, MAX_SIMILAR_SOURCES)
      .map((source) => source.id);

    const lists = await Promise.all(
      sourceIds.map((id) => this.recommendationsFor(mediaType, id)),
    );
    return lists.flat();
  }

  private async recommendationsFor(
    mediaType: MediaType,
    id: number,
  ): Promise<FeedCandidate[]> {
    try {
      const res = await this.tmdbService.getRecommendations<
        TMDB_Recommendations<DiscoveredDetail>
      >(mediaType, id, 1);
      return res.results.map((item) =>
        this.toCandidate(item, mediaType, 'similar'),
      );
    } catch {
      this.logger.warn(
        `Failed to fetch recommendations for ${mediaType}/${id}; skipping`,
      );
      return [];
    }
  }

  /** The always-on popular source; the engine gives it its own feed share. */
  private async fetchPopular(context: FeedContext): Promise<FeedCandidate[]> {
    const { mediaType } = context;
    // Discover paging advances in steps of DISCOVER_PAGES_PER_BUILD; popular
    // fetches one page per batch, so it walks pages 1, 2, 3… without gaps.
    const page = Math.ceil(
      context.nextTmdbPageToFetch / DISCOVER_PAGES_PER_BUILD,
    );
    const query = {
      sort: SortOption.POPULARITY,
      page,
    } as QueryParamsDto;

    // The avoid exclusions apply here too — "never show me X" holds even for
    // popular titles. The commitment lean doesn't.
    const cap = context.avoid.movieMaxRuntime;

    const results: DiscoveredDetail[] =
      mediaType === 'movie'
        ? (
            await this.movieService.getDiscoveredMovies(query, {
              ...this.avoidParams(context),
              'vote_count.gte': POPULAR_VOTE_COUNT_FLOOR,
              'with_runtime.gte': MIN_MOVIE_RUNTIME,
              ...(cap !== null && { 'with_runtime.lte': cap }),
            })
          ).results
        : (
            await this.seriesService.getDiscoveredSeries(query, {
              ...this.avoidParams(context),
              'vote_count.gte': POPULAR_VOTE_COUNT_FLOOR,
            })
          ).results;

    return results.map((item) => this.toCandidate(item, mediaType, 'popular'));
  }

  private toCandidate(
    item: DiscoveredDetail,
    mediaType: MediaType,
    source: FeedCandidateSource,
  ): FeedCandidate {
    return {
      id: item.id,
      mediaType,
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
