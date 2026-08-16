import { Injectable } from '@nestjs/common';
import { CacheService } from '@/cache/cache.service';
import { MovieService } from '@/movie/movie.service';
import { SeriesService } from '@/series/series.service';
import { MediaType } from '@/types/media-type';
import { SortOption } from '@/common/types/media-query';
import { FeedResDto } from '@/feed/dto/feed.dto';
import { Cacheable } from '@/cache/cacheable.decorator';
import { Duration } from '@/common/app.constants';
import { MAX_FEED_PAGE } from '@/feed/engine/constants/feed.constant';
import { TmdbService } from '@/tmdb/tmdb.service';
import { TMDB_Recommendations } from '@/tmdb/tmdb.type';

@Injectable()
export class FeedService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly movieService: MovieService,
    private readonly seriesService: SeriesService,
    private readonly tmdbService: TmdbService,
  ) {}

  /**
   * The links the walk follows. Kept for a month because these lists hardly
   * change and one walk asks for hundreds of them.
   */
  @Cacheable({
    key: (mediaType: MediaType, id: number) =>
      `feed-recommendation-ids-${mediaType}-${id}`,
    ttl: Duration.ONE_MONTH,
  })
  async getRecommendationIds(
    mediaType: MediaType,
    id: number,
  ): Promise<number[]> {
    const response = await this.tmdbService.getRecommendations<
      TMDB_Recommendations<{ id: number }>
    >(mediaType, id);
    return response.results.map((title) => title.id);
  }

  async getFeed(
    userId: number | null,
    mediaType: MediaType,
    page: number,
    refresh: boolean,
  ): Promise<FeedResDto> {
    return this.publicFeed(mediaType, page, refresh);
  }

  /**
   * A refresh of page 2 answers with some other page of the popular list, so the
   * titles are new. The response still says `page: 2` — the app counts on it.
   */
  private async publicFeed(
    mediaType: MediaType,
    page: number,
    refresh: boolean,
  ): Promise<FeedResDto> {
    const feed = await this.guestFeed(
      mediaType,
      refresh ? this.otherPublicPage(page) : page,
    );
    return { ...feed, page };
  }

  private otherPublicPage(page: number): number {
    const offset = 1 + Math.floor(Math.random() * (MAX_FEED_PAGE - 1));
    return ((page - 1 + offset) % MAX_FEED_PAGE) + 1;
  }

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
      // Capped: the DTO rejects pages past MAX_FEED_PAGE, so never promise one.
      total_pages: Math.min(res.total_pages, MAX_FEED_PAGE),
      total_results: res.total_results,
    };
  }
}
