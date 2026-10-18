import { Injectable } from '@nestjs/common';
import { CacheService } from '@/cache/cache.service';
import { Cacheable } from '@/cache/cacheable.decorator';
import { Duration } from '@/common/app.constants';
import { PosterResDto } from '@/common/dto/poster.dto';
import { GENRES } from '@/constants/items/genres.constant';
import {
  parseSource,
  SourcePlaceholderValues,
} from '@/explore/sources/source.utils';
import { ImagesService } from '@/images/images.service';
import { getImageWithFallback } from '@/images/images.utils';
import { PosterInfo } from '@/images/poster';
import { TmdbService } from '@/tmdb/tmdb.service';
import {
  TMDB_DiscoveredMovieDetail,
  TMDB_DiscoveredSeriesDetail,
} from '@/tmdb/tmdb.type';
import { MediaType } from '@/types/media-type';

const getSourceCacheKey = (
  endpoint: string,
  mediaType: MediaType,
  params: Record<string, string>,
): string => {
  const sourceValues = { ...params };
  delete sourceValues.page;
  const sourceParams = new URLSearchParams(sourceValues);
  sourceParams.sort();

  return `explore-source-${mediaType}-${endpoint}?${sourceParams}`;
};

@Injectable()
export class ExploreSourceService {
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly imagesService: ImagesService,
    private readonly cacheService: CacheService,
  ) {}

  async getSourcePage(
    source: string,
    mediaType: MediaType,
    page: number,
    values: SourcePlaceholderValues,
  ): Promise<PosterResDto> {
    const { endpoint, params } = parseSource(source, page, values);

    return this.fetchSourcePage(endpoint, mediaType, params);
  }

  async getAlreadyCachedSourcePages(
    source: string,
    mediaType: MediaType,
    values: SourcePlaceholderValues,
  ): Promise<number[]> {
    const { endpoint, params } = parseSource(source, 1, values);
    const sourceKey = getSourceCacheKey(endpoint, mediaType, params);
    const pages = await this.cacheService.smembers(`${sourceKey}-pages`);

    return pages.map(Number);
  }

  // fetches the first 5 pages of the sources, or less if there aren't 5 pages in total
  async prepareSourcePages(
    source: string,
    mediaType: MediaType,
    values: SourcePlaceholderValues,
  ): Promise<void> {
    const firstPageData = await this.getSourcePage(
      source,
      mediaType,
      1,
      values,
    );
    const pages = [2, 3, 4, 5].filter(
      (page) => page <= firstPageData.total_pages,
    );

    // fetching 2 pages at a time
    for (let i = 0; i < pages.length; i += 2) {
      await Promise.all(
        pages
          .slice(i, i + 2)
          .map((page) => this.getSourcePage(source, mediaType, page, values)),
      );
    }
  }

  @Cacheable({
    key: (
      endpoint: string,
      mediaType: MediaType,
      params: Record<string, string>,
    ) =>
      `${getSourceCacheKey(endpoint, mediaType, params)}-page=${params.page}`,
    ttl: Duration.ONE_WEEK,
  })
  private async fetchSourcePage(
    endpoint: string,
    mediaType: MediaType,
    params: Record<string, string>,
  ): Promise<PosterResDto> {
    let sourcePageData: PosterResDto;

    switch (mediaType) {
      case 'movie': {
        const response =
          await this.tmdbService.getList<TMDB_DiscoveredMovieDetail>(
            endpoint,
            params,
          );
        sourcePageData = {
          page: response.page,
          results: this.filterLowQualityTitles(response.results).map((title) =>
            this.createPoster(title, mediaType, title.title),
          ),
          total_pages: response.total_pages,
          total_results: response.total_results,
        };
        break;
      }
      case 'series': {
        const response =
          await this.tmdbService.getList<TMDB_DiscoveredSeriesDetail>(
            endpoint,
            params,
          );
        sourcePageData = {
          page: response.page,
          results: this.filterLowQualityTitles(response.results).map((title) =>
            this.createPoster(title, mediaType, title.name),
          ),
          total_pages: response.total_pages,
          total_results: response.total_results,
        };
        break;
      }
    }

    await this.cacheService.sadd(
      `${getSourceCacheKey(endpoint, mediaType, params)}-pages`,
      params.page,
      Duration.ONE_WEEK,
    );

    return sourcePageData;
  }

  private createPoster(
    title: TMDB_DiscoveredMovieDetail | TMDB_DiscoveredSeriesDetail,
    mediaType: MediaType,
    titleName: string,
  ): PosterInfo {
    return {
      id: title.id,
      mediaType,
      posterPath: getImageWithFallback(
        title.poster_path,
        `${mediaType}_poster`,
      ),
      blurhash: this.imagesService.generatePlaceholderBlurhash({
        id: title.id,
      }),
      preview: {
        title: titleName,
        overview: title.overview || '',
        genres: GENRES.filter((genre) =>
          (title.genre_ids ?? []).includes(genre.id),
        ),
      },
    };
  }

  private filterLowQualityTitles<
    Title extends TMDB_DiscoveredMovieDetail | TMDB_DiscoveredSeriesDetail,
  >(titles: Title[]): Title[] {
    const titlesWithPosters = this.filterTitlesWithPosters(titles);
    return this.filterTitlesWithNames(titlesWithPosters);
  }

  private filterTitlesWithPosters<
    Title extends TMDB_DiscoveredMovieDetail | TMDB_DiscoveredSeriesDetail,
  >(titles: Title[]): Title[] {
    return titles.filter((title) => Boolean(title.poster_path));
  }

  private filterTitlesWithNames<
    Title extends TMDB_DiscoveredMovieDetail | TMDB_DiscoveredSeriesDetail,
  >(titles: Title[]): Title[] {
    return titles.filter((title) => 'title' in title || 'name' in title);
  }
}
