import { Injectable } from '@nestjs/common';
import { EnvService } from '../env/env.service';
import { Cacheable } from '../cache/cacheable.decorator';
import axios from 'axios';
import { TMDB_BASE_URL } from '../common/app.constants';
import { MediaType } from '../types/media-type';
import {
  TMDB_DiscoverMovieQuery,
  TMDB_DiscoverSeriesQuery,
  TMDB_MovieCredits,
  TMDB_MultiSearch,
  TMDB_Person,
  TMDB_SearchQuery,
} from './tmdb.type';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class TmdbService {
  private readonly TMDB_API_KEY: string;

  constructor(
    private readonly env: EnvService,
    private readonly cacheService: CacheService,
  ) {
    this.TMDB_API_KEY = this.env.get('TMDB_API_KEY');
  }

  async multiSearch(query: string): Promise<TMDB_MultiSearch> {
    return this.get<TMDB_MultiSearch, TMDB_SearchQuery>('search/multi', {
      query,
    });
  }

  async getPerson(id: number): Promise<TMDB_Person> {
    return this.get<TMDB_Person>(`person/${id}`);
  }

  async getMovieCredits(movieId: number): Promise<TMDB_MovieCredits> {
    return this.get<TMDB_MovieCredits>(`movie/${movieId}/credits`);
  }

  @Cacheable({
    key: (mediaType: MediaType, id: number, append_to_response = '') =>
      `${mediaType}-basic-info-${id}-{${append_to_response}}`,
    ttl: 3600 * 24,
  })
  async getDetails<T>(
    mediaType: MediaType,
    id: number,
    append_to_response: string = '',
  ): Promise<T> {
    return this.get<T>(`${mediaType}/${id}`, {
      ...(append_to_response && { append_to_response }),
    });
  }

  async getDiscover<
    T,
    Q extends TMDB_DiscoverMovieQuery | TMDB_DiscoverSeriesQuery,
  >(mediaType: MediaType, params: Q): Promise<T> {
    return this.get<T, Q>(`discover/${mediaType}`, params);
  }

  private async get<
    T,
    P extends Record<string, any> = Record<string, string | number | boolean>,
  >(endpoint: string, params: P = {} as P): Promise<T> {
    const response = await axios.get<T>(`${TMDB_BASE_URL}/3/${endpoint}`, {
      params: {
        api_key: this.TMDB_API_KEY,
        include_adult: false,
        ...params,
      },
    });
    return response.data;
  }
}
