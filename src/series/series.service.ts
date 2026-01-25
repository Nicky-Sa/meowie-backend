import { Injectable, Logger } from '@nestjs/common';
import { EnvService } from '../env/env.service';
import { CacheService } from '../cache/cache.service';
import { TMDB_SeriesDetail, TMDB_SeriesList } from '../models/thirdparty/tmdb';
import { SortOption } from '../movies/models/query.model';
import axios from 'axios';
import { TMDB_BASE_URL } from '../utils/constants';
import { InterestingSeriesIdsResDto, QueryParamsDto } from './dto/series.dto';

@Injectable()
export class SeriesService {
  private readonly TMDB_API_KEY: string;
  private readonly logger = new Logger();

  constructor(
    private readonly env: EnvService,
    private readonly cacheService: CacheService,
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

  private isSeriesValid(series: TMDB_SeriesDetail): boolean {
    return Boolean(series.name && series.overview);
  }
}
