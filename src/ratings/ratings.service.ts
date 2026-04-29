import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { RatingEntry } from './types/rating.type';
import { WHATSON_BASE_URL } from '../common/app.constants';
import { Whatson_MediaItem } from './types/whatson.type';
import { Cacheable } from '../cache/cacheable.decorator';
import { CacheDuration } from '../cache/cache.constants';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class RatingsService {
  private readonly logger = new Logger(RatingsService.name);

  constructor(public readonly cacheService: CacheService) {}

  @Cacheable({
    key: (mediaType: 'movie' | 'tvshow', id: number) =>
      `ratings-${mediaType}-${id}`,
    ttl: CacheDuration.ONE_DAY,
  })
  async getRatings(
    mediaType: 'movie' | 'tvshow',
    id: number,
    tmdbVoteAverage: number,
  ): Promise<RatingEntry[]> {
    try {
      const response = await axios.get<Whatson_MediaItem>(
        `${WHATSON_BASE_URL}/${mediaType}/${id}`,
      );
      const item = response.data;

      return [
        this.getImdbRating(item),
        this.getRottenTomatoesRating(item),
        this.getMetacriticRating(item),
        this.getTmdbRating(item, tmdbVoteAverage),
      ];
    } catch {
      this.logger.warn(
        `Failed to fetch ratings from Whatson for ${mediaType}/${id}`,
      );
      // Return N/A for all sources on error
      return [
        { source: 'IMDb', value: 'N/A' },
        { source: 'Rotten Tomatoes', value: 'N/A' },
        { source: 'Metacritic', value: 'N/A' },
        {
          source: 'TMDB',
          value: tmdbVoteAverage
            ? `${Math.floor(tmdbVoteAverage * 10) / 10}`
            : 'N/A',
        },
      ];
    }
  }

  private getImdbRating(item: Whatson_MediaItem): RatingEntry {
    if (!item.imdb?.users_rating) {
      return { source: 'IMDb', value: 'N/A' };
    }
    return {
      source: 'IMDb',
      value: `${item.imdb.users_rating}`,
    };
  }

  private getRottenTomatoesRating(item: Whatson_MediaItem): RatingEntry {
    if (typeof item.rotten_tomatoes?.critics_rating !== 'number') {
      return { source: 'Rotten Tomatoes', value: 'N/A' };
    }
    const value = Math.floor(item.rotten_tomatoes.critics_rating * 10) / 10;
    return {
      source: 'Rotten Tomatoes',
      value: `${value}%`,
    };
  }

  private getMetacriticRating(item: Whatson_MediaItem): RatingEntry {
    if (typeof item.metacritic?.critics_rating !== 'number') {
      return { source: 'Metacritic', value: 'N/A' };
    }
    const value = Math.floor(item.metacritic.critics_rating * 10) / 10;
    return {
      source: 'Metacritic',
      value: `${value}`,
    };
  }

  private getTmdbRating(
    item: Whatson_MediaItem,
    tmdbVoteAverage?: number,
  ): RatingEntry {
    const rating = item.tmdb?.users_rating || tmdbVoteAverage;
    if (typeof rating !== 'number') {
      return { source: 'TMDB', value: 'N/A' };
    }
    const value = Math.floor(rating * 10) / 10;
    return {
      source: 'TMDB',
      value: `${value}`,
    };
  }
}
