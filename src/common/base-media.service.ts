import { TmdbService } from '@/tmdb/tmdb.service';
import {
  TMDB_WatchProviders,
  TMDB_WatchProvider,
  TMDB_Recommendations,
  TMDB_DiscoverMovieQuery,
  TMDB_DiscoverSeriesQuery,
} from '@/tmdb/tmdb.type';
import { WatchProviders } from '@/types/watch-provider';
import { getImage } from '@/images/images.utils';
import { PosterResDto } from '@/common/dto/poster.dto';
import { SortOption } from '@/common/types/media-query';
import { PosterInfo } from '@/images/poster';

export abstract class BaseMediaService {
  protected abstract readonly mediaType: 'movie' | 'series';
  protected abstract readonly tmdbMediaType: 'movie' | 'tv';

  protected constructor(protected readonly tmdbService: TmdbService) {}

  protected constructDiscoveryParams<
    TQuery extends TMDB_DiscoverMovieQuery | TMDB_DiscoverSeriesQuery,
  >(
    query: {
      sort: SortOption;
      genres?: string;
      personId?: string;
      languages?: string;
      decade?: string;
      tmdbRatings?: string;
      page?: number;
    },
    dateField: string,
    tmdbQuery?: TQuery,
  ): TQuery {
    const params: Record<string, unknown> = {
      ...tmdbQuery,
      ...this.constructSortRelatedParams(query.sort, dateField),
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
        [`${dateField}.gte`]: `${query.decade}-01-01`,
        [`${dateField}.lte`]: `${Number(query.decade) + 9}-12-31`,
      }),
      ...(query.tmdbRatings && {
        'vote_average.gte': Number(query.tmdbRatings.split(',')[0]),
        'vote_average.lte': Number(query.tmdbRatings.split(',')[1]),
      }),
      page: query.page ?? 1,
    };
    return params as TQuery;
  }

  protected constructWatchProviders(
    id: number,
    watchProviders: TMDB_WatchProviders,
    country: string,
  ): WatchProviders {
    const data = watchProviders.results[country];
    const fallbackTmdbLink = `https://www.themoviedb.org/${this.tmdbMediaType}/${id}/watch`;

    if (!data)
      return {
        flatrate: [],
        rent: [],
        buy: [],
        tmdbLink: fallbackTmdbLink,
      };

    const mapProvider = (p: TMDB_WatchProvider) => ({
      logoPath: getImage(p.logo_path, 'watch_provider'),
      providerId: p.provider_id,
      providerName: p.provider_name,
    });

    return {
      flatrate: (data.flatrate || []).map(mapProvider),
      rent: (data.rent || []).map(mapProvider),
      buy: (data.buy || []).map(mapProvider),
      tmdbLink: data.link || fallbackTmdbLink,
    };
  }

  protected async getRecommendationsBase<T>(
    id: number,
    page: number = 1,
    mapFn: (item: T) => PosterInfo,
  ): Promise<PosterResDto> {
    const response = await this.tmdbService.getRecommendations<
      TMDB_Recommendations<T>
    >(this.mediaType, id, page);

    return {
      results: response.results.map(mapFn),
      page: response.page,
      total_pages: response.total_pages,
      total_results: response.total_results,
    };
  }

  protected async getInterestingIdsBase<
    TList extends { results: { id: number }[] },
  >(
    discoverFn: () => Promise<TList>,
  ): Promise<{ results: number[] } & Omit<TList, 'results'>> {
    const discoveredMedia = await discoverFn();

    const data = {
      ...discoveredMedia,
      results: discoveredMedia.results.map((item) => item.id),
    };

    return data;
  }

  protected constructSortRelatedParams(
    sort: SortOption,
    dateField: string,
  ): Record<string, string | number> {
    switch (sort) {
      case SortOption.RANDOM:
        return {
          sort_by: 'vote_count.desc',
        };
      case SortOption.NEWEST:
        return {
          sort_by: `${dateField}.desc`,
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
