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
import { isMovie } from '@/utils/media';

const getSourceCacheKey = (
  endpoint: string,
  params: Record<string, string>,
): string => {
  const sourceValues = { ...params };
  delete sourceValues.page;
  const sourceParams = new URLSearchParams(sourceValues);
  sourceParams.sort();

  return `explore-source-${endpoint}?${sourceParams}`;
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
    page: number,
    values: SourcePlaceholderValues,
  ): Promise<PosterResDto> {
    const { endpoint, params } = parseSource(source, page, values);

    return this.fetchSourcePage(endpoint, params);
  }

  async getAlreadyCachedSourcePages(
    source: string,
    values: SourcePlaceholderValues,
  ): Promise<number[]> {
    const { endpoint, params } = parseSource(source, 1, values);
    const sourceKey = getSourceCacheKey(endpoint, params);
    const pages = await this.cacheService.smembers(`${sourceKey}-pages`);

    return pages.map(Number);
  }

  // fetches the first 5 pages of the sources, or less if there aren't 5 pages in total
  async prepareSourcePages(
    source: string,
    values: SourcePlaceholderValues,
  ): Promise<void> {
    const firstPageData = await this.getSourcePage(source, 1, values);
    const pages = [2, 3, 4, 5].filter(
      (page) => page <= firstPageData.total_pages,
    );

    // fetching 2 pages at a time
    for (let i = 0; i < pages.length; i += 2) {
      await Promise.all(
        pages
          .slice(i, i + 2)
          .map((page) => this.getSourcePage(source, page, values)),
      );
    }
  }

  @Cacheable({
    key: (endpoint: string, params: Record<string, string>) =>
      `${getSourceCacheKey(endpoint, params)}-page=${params.page}`,
    ttl: Duration.ONE_WEEK,
  })
  private async fetchSourcePage(
    endpoint: string,
    params: Record<string, string>,
  ): Promise<PosterResDto> {
    const response = await this.tmdbService.getList<
      TMDB_DiscoveredMovieDetail | TMDB_DiscoveredSeriesDetail
    >(endpoint, params);

    const results = this.filterLowQualityTitles(
      response.results,
    ).map<PosterInfo>((title) => {
      const mediaType = isMovie(title) ? 'movie' : 'series';

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
          title: isMovie(title) ? title.title : title.name,
          overview: title.overview || '',
          genres: GENRES.filter((genre) =>
            (title.genre_ids ?? []).includes(genre.id),
          ),
        },
      };
    });

    const sourcePage: PosterResDto = {
      page: response.page,
      results,
      total_pages: response.total_pages,
      total_results: response.total_results,
    };
    await this.cacheService.sadd(
      `${getSourceCacheKey(endpoint, params)}-pages`,
      params.page,
      Duration.ONE_WEEK,
    );

    return sourcePage;
  }

  private filterLowQualityTitles(
    titles: (TMDB_DiscoveredMovieDetail | TMDB_DiscoveredSeriesDetail)[],
  ) {
    const titlesWithPosters = this.filterTitlesWithPosters(titles);
    return this.filterTitlesWithNames(titlesWithPosters);
  }

  private filterTitlesWithPosters(
    titles: (TMDB_DiscoveredMovieDetail | TMDB_DiscoveredSeriesDetail)[],
  ) {
    return titles.filter((title) => Boolean(title.poster_path));
  }

  private filterTitlesWithNames(
    titles: (TMDB_DiscoveredMovieDetail | TMDB_DiscoveredSeriesDetail)[],
  ) {
    return titles.filter((title) => 'title' in title || 'name' in title);
  }
}
