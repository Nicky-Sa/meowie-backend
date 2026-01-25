import { Injectable } from '@nestjs/common';
import { EnvService } from '../env/env.service';
import { CacheService } from '../cache/cache.service';
import {
  TMDB_SeriesDetail,
  TMDB_SeriesInfo,
  TMDB_SeriesList,
} from '../models/thirdparty/tmdb';
import axios from 'axios';
import { TMDB_BASE_URL } from '../utils/constants';
import {
  InterestingSeriesIdsResDto,
  QueryParamsDto,
  SeriesCredits,
  SeriesInfoResDto,
} from './dto/series.dto';
import { Cacheable } from '../cache/cacheable.decorator';
import { SortOption } from '../models/shared-query.model';
import { MediaUtilsService } from '../media-utils/media-utils.service';
import { getImage } from '../models/image.model';
import { CastInfo } from '../models/info.model';

@Injectable()
export class SeriesService {
  private readonly TMDB_API_KEY: string;

  constructor(
    private readonly env: EnvService,
    private readonly cacheService: CacheService,
    private readonly mediaUtilsService: MediaUtilsService,
  ) {
    this.TMDB_API_KEY = this.env.get('TMDB_API_KEY');
  }

  async getDiscoveredSeries(
    query: QueryParamsDto,
    tmdbQuery?: Record<string, string | number>,
  ): Promise<TMDB_SeriesList> {
    // Sort defaults to popularity.desc by TMDB
    const sort =
      query.sort === SortOption.RANDOM ? 'vote_count.desc' : query.sort;

    const response = await axios.get<TMDB_SeriesList>(
      `${TMDB_BASE_URL}/3/discover/tv`,
      {
        params: {
          api_key: this.TMDB_API_KEY,
          include_adult: false,
          sort_by: sort,
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
            'vote_average.gte': query.tmdbRatings.split(',')[0],
            'vote_average.lte': query.tmdbRatings.split(',')[1],
          }),
          page: query.page ?? 1,
          ...tmdbQuery,
        },
      },
    );

    const validSeries = response.data.results.filter((series) =>
      this.isSeriesValid(series),
    );
    return {
      ...response.data,
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
    const response = await axios.get<T>(`${TMDB_BASE_URL}/3/tv/${id}`, {
      params: {
        api_key: this.TMDB_API_KEY,
        ...(append_to_response && { append_to_response }),
      },
    });
    return response.data;
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
      await this.mediaUtilsService.generatePosterProps(posterPath);
    const ratings = await this.mediaUtilsService.getRatings(
      'tvshow',
      id,
      item.vote_average,
    );

    const data: SeriesInfoResDto = {
      title: item.name,
      airingYears: `${item.first_air_date.slice(0, 4)} - ${item.last_air_date.slice(
        0,
        4,
      )}`,
      avgDuration: item.episode_run_time[0] + ' min',
      contentRating: item.content_ratings.results[0].rating,
      trailerKey: this.mediaUtilsService.findTrailerKey(item.videos),
      posterPath,
      overview: item.overview,
      genres: this.mediaUtilsService.formatGenres(item.genres),
      posterProps,
      credits: this.constructSeriesCredits(item.credits, item.created_by),
      ratings,
    };
    return data;
  }

  private isSeriesValid(series: TMDB_SeriesDetail): boolean {
    return Boolean(series.name && series.overview);
  }

  private constructSeriesCredits(
    credits: TMDB_SeriesInfo['credits'],
    createdBy: TMDB_SeriesInfo['created_by'],
  ): SeriesCredits {
    return {
      casts: this.mediaUtilsService.formatCasts(credits.cast),
      creator: this.formatCreator(createdBy),
    };
  }

  private formatCreator(createdBy: TMDB_SeriesInfo['created_by']): CastInfo {
    const creator = createdBy[0];
    if (!creator) {
      return this.mediaUtilsService.emptyCast;
    }
    return {
      id: creator.id,
      name: creator.name,
      character: 'Creator',
      creditId: creator.credit_id,
      profilePath: getImage(creator.profile_path, 'person'),
    };
  }
}
