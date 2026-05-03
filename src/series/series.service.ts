import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import {
  TMDB_DiscoverSeriesQuery,
  TMDB_DiscoveredSeriesDetail,
  TMDB_SeriesInfo,
  TMDB_DiscoveredSeriesList,
  TMDB_WatchProviders,
  TMDB_WatchProvider,
  TMDB_Recommendations,
} from '../tmdb/tmdb.type';
import {
  InterestingSeriesIdsResDto,
  QueryParamsDto,
  SeriesCredits,
  SeriesInfoResDto,
} from './dto/series.dto';
import { Cacheable } from '../cache/cacheable.decorator';
import { SortOption } from '../common/types/media-query';
import { getImage } from '../images/images.utils';
import { CreditInfo } from '../types/credit';
import { TmdbService } from '../tmdb/tmdb.service';
import { ImagesService } from '../images/images.service';
import { RatingsService } from '../ratings/ratings.service';
import {
  findTrailerKey,
  formatCasts,
  formatCrew,
  formatGenres,
  emptyCredit,
} from '../utils/media';
import { PosterResDto } from '../common/dto/poster.dto';
import { Duration } from '../common/app.constants';
import { extractYearFromDate } from '../utils/dates';

import { GENRES } from '../constants/items/genres.constant';
import { WatchProviders } from '../types/watch-provider';

@Injectable()
export class SeriesService {
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly cacheService: CacheService,
    private readonly ratingsService: RatingsService,
    private readonly imagesService: ImagesService,
  ) {}

  async getDiscoveredSeries(
    query: QueryParamsDto,
    tmdbQuery?: TMDB_DiscoverSeriesQuery,
  ): Promise<TMDB_DiscoveredSeriesList> {
    const response = await this.tmdbService.getDiscover<
      TMDB_DiscoveredSeriesList,
      TMDB_DiscoverSeriesQuery
    >('series', {
      ...tmdbQuery,
      ...(this.constructSortRelatedParams(
        query.sort,
      ) as Partial<TMDB_DiscoverSeriesQuery>),
      ...(query.genres && {
        with_genres: query.genres.replaceAll(',', '|'),
      }),
      ...(query.personId && {
        with_people: query.personId,
      }),
      ...(query.languages && {
        with_original_language: query.languages.replaceAll(',', '|'),
      }),
      ...(query.decade && {
        'first_air_date.gte': `${query.decade}-01-01`,
        'first_air_date.lte': `${Number(query.decade) + 9}-12-31`,
      }),
      ...(query.tmdbRatings && {
        'vote_average.gte': Number(query.tmdbRatings.split(',')[0]),
        'vote_average.lte': Number(query.tmdbRatings.split(',')[1]),
      }),
      ...(query.format === 'miniseries' && {
        with_type: '2',
      }),
      ...(query.format === 'multiple-seasons' && {
        with_type: `0|1|3|4|5|6`,
      }),
      page: query.page ?? 1,
    });

    const validSeries = response.results.filter((tvShow) =>
      this.isSeriesValid(tvShow),
    );
    return {
      ...response,
      results: validSeries,
    };
  }

  async getInterestingSeriesIds(
    query: Pick<QueryParamsDto, 'page' | 'sort'>,
  ): Promise<InterestingSeriesIdsResDto> {
    const discoveredSeries = await this.getDiscoveredSeries(query, {
      'vote_count.gte': 50,
    });

    const data = {
      ...discoveredSeries,
      results: discoveredSeries.results.map((tvShow) => tvShow.id),
    };

    return data;
  }

  @Cacheable({
    key: (id: number, append_to_response = '') =>
      `series-basic-info-${id}-{${append_to_response}}`,
    ttl: Duration.ONE_DAY,
  })
  async getBasicSeriesInfo<T>(
    id: number,
    append_to_response: string = '',
  ): Promise<T> {
    return this.tmdbService.getDetails<T>('series', id, append_to_response);
  }

  @Cacheable({
    key: (id: number) => `series-info-${id}`,
    ttl: Duration.ONE_DAY,
  })
  async getSeriesInfo(id: number): Promise<SeriesInfoResDto> {
    const [item, recommendations] = await Promise.all([
      this.getBasicSeriesInfo<TMDB_SeriesInfo>(
        id,
        'videos,content_ratings,credits,watch/providers',
      ),
      this.getSeriesRecommendations(id),
    ]);
    const posterPath = getImage(item.poster_path, 'series_poster');
    const [blurhash, primaryColorHex] = await Promise.all([
      this.imagesService.generateBlurhash(posterPath),
      this.imagesService.generatePrimaryColorHex(posterPath),
    ]);
    const posterProps = { blurhash, primaryColorHex };
    const ratings = await this.ratingsService.getRatings(
      'tvshow',
      id,
      item.vote_average,
    );

    const data: SeriesInfoResDto = {
      title: item.name,
      airingYears: this.constructAiringYears(
        item.first_air_date,
        item.last_air_date,
        item.status,
      ),
      seasonsText: this.constructSeasons(item.number_of_seasons),
      contentRating: this.findContentRating(item.content_ratings),
      trailerKey: findTrailerKey(item.videos),
      posterPath,
      overview: item.overview,
      genres: formatGenres(item.genres),
      posterProps,
      credits: this.constructSeriesCredits(item.credits, item.created_by),
      ratings,
      watchProviders: this.constructWatchProviders(item['watch/providers']),
      recommendations,
    };
    return data;
  }

  async getSeriesPosters(query: QueryParamsDto): Promise<PosterResDto> {
    const discoveredSeriesList = await this.getDiscoveredSeries(query);
    const { results: series, ...rest } = discoveredSeriesList;
    const results = await Promise.all(
      series.map(async (tvShow) => this.mapToSeriesPoster(tvShow)),
    );
    return { results, ...rest };
  }

  private constructSeasons(numberOfSeasons: number): string {
    return `${numberOfSeasons} Season${numberOfSeasons === 1 ? '' : 's'}`;
  }

  private constructWatchProviders(
    watchProviders: TMDB_WatchProviders,
    country: string = 'US',
  ): WatchProviders {
    const data = watchProviders.results[country];
    if (!data) return { flatrate: [], rent: [], buy: [], tmdbLink: '' };

    const mapProvider = (p: TMDB_WatchProvider) => ({
      logoPath: getImage(p.logo_path, 'watch_provider'),
      providerId: p.provider_id,
      providerName: p.provider_name,
    });

    return {
      flatrate: (data.flatrate || []).map(mapProvider),
      rent: (data.rent || []).map(mapProvider),
      buy: (data.buy || []).map(mapProvider),
      tmdbLink: data.link || '',
    };
  }

  @Cacheable({
    key: (id: number, page: number = 1) =>
      `series-recommendations-${id}-p${page}`,
    ttl: Duration.ONE_DAY,
  })
  async getSeriesRecommendations(
    id: number,
    page: number = 1,
  ): Promise<PosterResDto> {
    const response = await this.tmdbService.getRecommendations<
      TMDB_Recommendations<TMDB_DiscoveredSeriesDetail>
    >('series', id, page);
    return this.constructRecommendations(response);
  }

  private async constructRecommendations(
    recommendations: TMDB_Recommendations<TMDB_DiscoveredSeriesDetail>,
  ): Promise<PosterResDto> {
    const results = await Promise.all(
      recommendations.results.map((series) => this.mapToSeriesPoster(series)),
    );
    return {
      results,
      page: recommendations.page,
      total_pages: recommendations.total_pages,
      total_results: recommendations.total_results,
    };
  }

  private async mapToSeriesPoster(tvShow: TMDB_DiscoveredSeriesDetail) {
    const posterPath = getImage(tvShow.poster_path, 'series_poster');
    const blurhash = await this.imagesService.generateBlurhash(posterPath);

    return {
      id: tvShow.id,
      posterPath,
      blurhash,
      mediaType: 'series' as const,
      preview: {
        title: tvShow.name,
        overview: tvShow.overview,
        genres: GENRES.filter((genre) => tvShow.genre_ids.includes(genre.id)),
      },
    };
  }

  private isSeriesValid(tvShow: TMDB_DiscoveredSeriesDetail): boolean {
    return Boolean(tvShow.name && tvShow.overview && tvShow.first_air_date);
  }

  private constructSeriesCredits(
    credits: TMDB_SeriesInfo['credits'],
    createdBy: TMDB_SeriesInfo['created_by'],
  ): SeriesCredits {
    return {
      casts: formatCasts(credits.cast),
      crew: formatCrew(credits.crew),
      creator: this.formatCreator(createdBy),
    };
  }

  private formatCreator(createdBy: TMDB_SeriesInfo['created_by']): CreditInfo {
    const creator = createdBy[0];
    if (!creator) {
      return emptyCredit;
    }
    return {
      id: creator.id,
      name: creator.name,
      role: 'Creator',
      creditId: creator.credit_id,
      profilePath: getImage(creator.profile_path, 'person'),
    };
  }

  private findContentRating(
    contentRatings: TMDB_SeriesInfo['content_ratings'],
    country: string = 'US',
  ) {
    return (
      contentRatings.results.find((result) => result.iso_3166_1 === country)
        ?.rating || 'N/A'
    );
  }

  private constructAiringYears(
    firstAirDate: string,
    lastAirDate: string | null,
    status: TMDB_SeriesInfo['status'],
  ): string {
    if (status === 'Returning Series') {
      if (firstAirDate) {
        return `${extractYearFromDate(firstAirDate)} - Now`;
      }
    }
    if (lastAirDate) {
      const startYear = extractYearFromDate(firstAirDate);
      const endYear = extractYearFromDate(lastAirDate);
      if (startYear === endYear) {
        return startYear;
      }
      return `${startYear} - ${endYear}`;
    }
    return `N/A`;
  }

  private constructSortRelatedParams(sort: SortOption) {
    switch (sort) {
      case SortOption.RANDOM:
        return {
          sort_by: 'vote_count.desc',
        };
      case SortOption.NEWEST:
        return {
          sort_by: 'first_air_date.desc',
        };
      case SortOption.POPULARITY:
        return {
          sort_by: 'popularity.desc',
          'vote_average.gte': 7,
          'vote_count.gte': 300,
        };
      default:
        return {
          sort_by: sort,
        };
    }
  }
}
