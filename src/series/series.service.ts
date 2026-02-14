import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import {
  TMDB_DiscoverSeriesQuery,
  TMDB_DiscoveredSeriesDetail,
  TMDB_SeriesInfo,
  TMDB_DiscoveredSeriesList,
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
import { CastInfo } from '../types/cast';
import { TmdbService } from '../tmdb/tmdb.service';
import { ImagesService } from '../images/images.service';
import { RatingsService } from '../ratings/ratings.service';
import {
  findTrailerKey,
  formatCasts,
  formatGenres,
  emptyCast,
} from '../utils/media';

@Injectable()
export class SeriesService {
  constructor(
    private readonly tmdb: TmdbService,
    private readonly cacheService: CacheService,
    private readonly ratingsService: RatingsService,
    private readonly imagesService: ImagesService,
  ) {}

  async getDiscoveredSeries(
    query: QueryParamsDto,
    tmdbQuery?: TMDB_DiscoverSeriesQuery,
  ): Promise<TMDB_DiscoveredSeriesList> {
    const response = await this.tmdb.getDiscover<
      TMDB_DiscoveredSeriesList,
      TMDB_DiscoverSeriesQuery
    >('tv', {
      sort_by: this.constructSort(query.sort),
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
        'primary_release_date.gte': `${query.decade}-01-01`,
        'primary_release_date.lte': `${Number(query.decade) + 9}-12-31`,
      }),
      ...(query.tmdbRatings && {
        'vote_average.gte': Number(query.tmdbRatings.split(',')[0]),
        'vote_average.lte': Number(query.tmdbRatings.split(',')[1]),
      }),
      page: query.page ?? 1,
      ...tmdbQuery,
    });

    const validSeries = response.results.filter((series) =>
      this.isSeriesValid(series),
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
      results: discoveredSeries.results.map((series) => series.id),
    };

    return data;
  }

  @Cacheable({
    key: (id: number, append_to_response = '') =>
      `series-basic-info-${id}-{${append_to_response}}`,
    ttl: 3600 * 24,
  })
  async getBasicSeriesInfo<T>(
    id: number,
    append_to_response: string = '',
  ): Promise<T> {
    return this.tmdb.getDetails<T>('tv', id, append_to_response);
  }

  @Cacheable({
    key: (id: number) => `series-info-${id}`,
    ttl: 3600 * 24,
  })
  async getSeriesInfo(id: number): Promise<SeriesInfoResDto> {
    const item = await this.getBasicSeriesInfo<TMDB_SeriesInfo>(
      id,
      'videos,content_ratings,credits',
    );
    const posterPath = getImage(item.poster_path, 'poster');
    const posterProps =
      await this.imagesService.generatePosterProps(posterPath);
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
      avgDuration: `${item.episode_run_time[0] || 'N/A'} min`,
      contentRating: this.findContentRating(item.content_ratings),
      trailerKey: findTrailerKey(item.videos),
      posterPath,
      overview: item.overview,
      genres: formatGenres(item.genres),
      posterProps,
      credits: this.constructSeriesCredits(item.credits, item.created_by),
      ratings,
    };
    return data;
  }

  private isSeriesValid(series: TMDB_DiscoveredSeriesDetail): boolean {
    return Boolean(series.name && series.overview);
  }

  private constructSeriesCredits(
    credits: TMDB_SeriesInfo['credits'],
    createdBy: TMDB_SeriesInfo['created_by'],
  ): SeriesCredits {
    return {
      casts: formatCasts(credits.cast),
      creator: this.formatCreator(createdBy),
    };
  }

  private formatCreator(createdBy: TMDB_SeriesInfo['created_by']): CastInfo {
    const creator = createdBy[0];
    if (!creator) {
      return emptyCast;
    }
    return {
      id: creator.id,
      name: creator.name,
      character: 'Creator',
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
    lastAirDate: string,
    status: TMDB_SeriesInfo['status'],
  ): `${string} - ${string}` {
    if (status === 'Returning Series') {
      return `${firstAirDate.slice(0, 4)} - Present`;
    }
    return `${firstAirDate.slice(0, 4)} - ${lastAirDate.slice(0, 4)}`;
  }

  private constructSort(sort: SortOption) {
    switch (sort) {
      case SortOption.RANDOM:
        return 'vote_count.desc';
      case SortOption.NEWEST:
        return 'first_air_date.desc';
      case SortOption.POPULARITY:
        return 'popularity.desc';
      default:
        return sort;
    }
  }
}
