import { Injectable } from '@nestjs/common';
import { EnvService } from '../env/env.service';
import axios from 'axios';
import { TMDB_BASE_URL } from '../common/app.constants';
import { MediaType } from '../types/media-type';
import {
  TMDB_DiscoverMovieQuery,
  TMDB_DiscoverSeriesQuery,
  TMDB_MultiSearch,
  TMDB_Person,
  TMDB_SearchQuery,
  TMDB_GenresList,
  TMDB_CombinedCredits,
  TMDB_FindByExternalId,
} from './tmdb.type';

@Injectable()
export class TmdbService {
  private readonly TMDB_API_KEY: string;

  constructor(private readonly env: EnvService) {
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

  async getMovieGenres(): Promise<TMDB_GenresList> {
    return this.get<TMDB_GenresList>('genre/movie/list');
  }

  async getSeriesGenres(): Promise<TMDB_GenresList> {
    return this.get<TMDB_GenresList>('genre/tv/list');
  }

  async getCombinedCredits(personId: number): Promise<TMDB_CombinedCredits> {
    return this.get<TMDB_CombinedCredits>(
      `person/${personId}/combined_credits`,
    );
  }

  async getRecommendations<T>(
    mediaType: MediaType,
    id: number,
    page: number = 1,
  ): Promise<T> {
    const tmdbMediaType = mediaType === 'series' ? 'tv' : mediaType;
    return this.get<T>(`${tmdbMediaType}/${id}/recommendations`, { page });
  }

  async getDetails<T>(
    mediaType: MediaType,
    id: number,
    append_to_response: string = '',
  ): Promise<T> {
    const tmdbMediaType = mediaType === 'series' ? 'tv' : mediaType;
    return this.get<T>(`${tmdbMediaType}/${id}`, {
      ...(append_to_response && { append_to_response }),
    });
  }

  async getList<
    R = Record<string, unknown>,
    P extends Record<string, string | number | boolean> = Record<
      string,
      string | number | boolean
    >,
  >(
    endpoint: string,
    params: P = {} as P,
  ): Promise<{
    page: number;
    results: R[];
    total_pages: number;
    total_results: number;
  }> {
    return this.get(endpoint, params);
  }

  async getDiscover<
    T,
    Q extends TMDB_DiscoverMovieQuery | TMDB_DiscoverSeriesQuery,
  >(mediaType: MediaType, params: Q): Promise<T> {
    const tmdbMediaType = mediaType === 'series' ? 'tv' : mediaType;
    return this.get<T, Q>(`discover/${tmdbMediaType}`, params);
  }

  async findByExternalId(
    externalId: string,
    external_source: string,
  ): Promise<TMDB_FindByExternalId> {
    return this.get<TMDB_FindByExternalId>(`find/${externalId}`, {
      external_source,
    });
  }

  async searchMovie(
    query: string,
    year?: number,
  ): Promise<{
    results: { id: number; title: string; release_date: string }[];
  }> {
    return this.get('search/movie', {
      query,
      ...(year && { primary_release_year: year }),
    });
  }

  async ping(): Promise<void> {
    await this.get('configuration');
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
