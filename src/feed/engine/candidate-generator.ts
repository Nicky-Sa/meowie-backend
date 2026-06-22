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
  TMDB_Recommendations,
} from '@/tmdb/tmdb.type';
import {
  DISCOVER_PAGES_PER_BUILD,
  MAX_LIBRARY_SOURCES,
  POPULAR_VOTE_COUNT_FLOOR,
  VOTE_COUNT_FLOOR,
} from '@/feed/feed.constants';

type DiscoveredDetail =
  | TMDB_DiscoveredMovieDetail
  | TMDB_DiscoveredSeriesDetail;

/**
 * The single candidate-generation stage: takes a context (profile + paging) and
 * turns it into catalog items via TMDB. Personalized sources (taste discovery +
 * library recommendations) run first; only if they yield nothing does the
 * popular fallback run, so the feed is never empty.
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
    const [discovered, recommended] = await Promise.all([
      this.discoverByKeywords(context),
      this.recommendFromLibrary(context),
    ]);

    const personalized = [...discovered, ...recommended];
    if (personalized.length > 0) {
      return personalized;
    }

    return this.popularFallback(context);
  }

  private async discoverByKeywords(
    context: FeedContext,
  ): Promise<FeedCandidate[]> {
    const { mediaType, profile } = context;
    const keywordIds = profile.keywordIds.map((k) => k.id);
    const genreIds = profile.genreIds.map((g) => g.id);
    const withKeywords = keywordIds.length ? keywordIds.join('|') : undefined;

    const pages = Array.from(
      { length: DISCOVER_PAGES_PER_BUILD },
      (_, i) => context.nextTmdbPageToFetch + i,
    );

    const batches = await Promise.all(
      pages.map((page) => {
        const query = {
          sort: SortOption.RANDOM,
          genres: genreIds.length ? genreIds.join(',') : undefined,
          page,
        } as QueryParamsDto;
        return this.discover(mediaType, query, withKeywords);
      }),
    );

    return batches
      .flat()
      .map((item) => this.toCandidate(item, mediaType, 'taste'));
  }

  private async discover(
    mediaType: MediaType,
    query: QueryParamsDto,
    withKeywords: string | undefined,
  ): Promise<DiscoveredDetail[]> {
    if (mediaType === 'movie') {
      const res = await this.movieService.getDiscoveredMovies(query, {
        ...(withKeywords && { with_keywords: withKeywords }),
        'vote_count.gte': VOTE_COUNT_FLOOR,
        'with_runtime.gte': 30,
      });
      return res.results;
    }

    const res = await this.seriesService.getDiscoveredSeries(query, {
      ...(withKeywords && { with_keywords: withKeywords }),
      'vote_count.gte': VOTE_COUNT_FLOOR,
    });
    return res.results;
  }

  private async recommendFromLibrary(
    context: FeedContext,
  ): Promise<FeedCandidate[]> {
    // Recommendations don't paginate alongside discover pages, so pull them once
    // on the first build batch — they cluster "more like your library" up top.
    if (context.nextTmdbPageToFetch !== 1) {
      return [];
    }

    const { mediaType, profile } = context;
    const sources =
      mediaType === 'movie'
        ? profile.libraryMovieIds
        : profile.librarySeriesIds;

    const seedIds = sources
      .filter((s) => s.weight > 0)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, MAX_LIBRARY_SOURCES)
      .map((s) => s.id);

    const lists = await Promise.all(
      seedIds.map((id) => this.recommendationsFor(mediaType, id)),
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

  private async popularFallback(
    context: FeedContext,
  ): Promise<FeedCandidate[]> {
    const { mediaType } = context;
    const query = {
      sort: SortOption.POPULARITY,
      page: context.nextTmdbPageToFetch,
    } as QueryParamsDto;

    if (mediaType === 'movie') {
      const res = await this.movieService.getDiscoveredMovies(query, {
        'vote_count.gte': POPULAR_VOTE_COUNT_FLOOR,
        'with_runtime.gte': 30,
      });
      return res.results.map((item) =>
        this.toCandidate(item, mediaType, 'popular'),
      );
    }

    const res = await this.seriesService.getDiscoveredSeries(query, {
      'vote_count.gte': POPULAR_VOTE_COUNT_FLOOR,
    });
    return res.results.map((item) =>
      this.toCandidate(item, mediaType, 'popular'),
    );
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
      source,
    };
  }
}
