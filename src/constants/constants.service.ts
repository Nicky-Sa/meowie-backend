import { Injectable } from '@nestjs/common';
import { TmdbService } from '../tmdb/tmdb.service';
import { Cacheable } from '../cache/cacheable.decorator';
import { CacheDuration } from '../cache/cache.constants';
import { TMDB_GenresList } from '../tmdb/tmdb.type';
import { Genre, GenresResDto } from './constants.dto';
import { getGenreEmoji } from '../utils/media';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ConstantsService {
  constructor(
    private readonly tmdb: TmdbService,
    private readonly cacheService: CacheService,
  ) {}

  @Cacheable({
    key: () => 'movie-genres',
    ttl: CacheDuration.ONE_MONTH,
  })
  async getMovieGenres(): Promise<Genre[]> {
    const list: TMDB_GenresList = await this.tmdb.getMovieGenres();
    return list.genres.map((genre) => ({
      ...genre,
      emoji: getGenreEmoji(genre.id),
    }));
  }

  @Cacheable({
    key: () => 'tv-genres',
    ttl: CacheDuration.ONE_MONTH,
  })
  async getTvGenres(): Promise<Genre[]> {
    const list: TMDB_GenresList = await this.tmdb.getTvGenres();
    return list.genres.map((genre) => ({
      ...genre,
      emoji: getGenreEmoji(genre.id),
    }));
  }

  async getGenres(): Promise<GenresResDto> {
    const [movieGenres, tvGenres] = await Promise.all([
      this.getMovieGenres(),
      this.getTvGenres(),
    ]);
    return {
      movieGenres,
      tvGenres,
    };
  }
}
