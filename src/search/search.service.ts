import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  TMDB_MultiSearch,
  TMDB_MultiSearchDetail,
} from '../models/thirdparty/tmdb';
import { TMDB_BASE_URL } from '../utils/constants';
import { EnvService } from '../env/env.service';
import { MultiSearchResDto } from './dto/search.dto';
import { getGenreName, searchGenres } from '../models/genres.model';
import { getImage } from '../models/image.model';
import { extractYearFromDate } from '../utils/functions/dates';
import { MultiSearchResults } from './models/search-results.model';

@Injectable()
export class SearchService {
  private readonly TMDB_API_KEY: string;

  constructor(private readonly env: EnvService) {
    this.TMDB_API_KEY = this.env.get('TMDB_API_KEY');
  }

  async multiSearch(query: string): Promise<MultiSearchResDto> {
    if (!query) {
      return { results: [] };
    }
    const response = await axios.get<TMDB_MultiSearch>(
      `${TMDB_BASE_URL}/3/search/multi`,
      {
        params: {
          api_key: this.TMDB_API_KEY,
          query,
        },
      },
    );

    const results: MultiSearchResults[] = response.data.results
      .filter(
        (result) =>
          result.media_type === 'person' || result.media_type === 'movie',
      )
      .filter((result) => this.isResultValid(result))
      .map((result) => {
        switch (result.media_type) {
          case 'person':
            return {
              mediaType: result.media_type,
              id: result.id,
              name: result.name,
              knownForDepartment: result.known_for_department.toLowerCase(),
              profilePath: getImage(result.profile_path, 'person'),
            };
          case 'movie':
            return {
              mediaType: result.media_type,
              id: result.id,
              title: result.title,
              posterPath: getImage(result.poster_path, 'poster'),
              genres: result.genre_ids
                .map((id) => getGenreName(id))
                .filter(Boolean),
              releaseYear: extractYearFromDate(result.release_date),
            };
        }
      });
    const matchingGenres = searchGenres(query);

    if (matchingGenres.length > 0) {
      results.push(
        ...matchingGenres.map((genre) => ({
          mediaType: 'genre' as const,
          ...genre,
        })),
      );
    }

    return { results };
  }

  private isResultValid(result: TMDB_MultiSearchDetail): boolean {
    switch (result.media_type) {
      case 'person':
        return Boolean(result.name && result.known_for_department);
      case 'movie':
        return Boolean(
          result.title && result.genre_ids.length > 0 && result.release_date,
        );
    }
    return false;
  }
}
