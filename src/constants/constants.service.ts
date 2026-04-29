import { Injectable } from '@nestjs/common';
import { TmdbService } from '../tmdb/tmdb.service';
import { Cacheable } from '../cache/cacheable.decorator';
import { TMDB_GenresList } from '../tmdb/tmdb.type';
import { Genre, GenresResDto } from './constants.dto';
import { getGenreEmoji } from '../utils/media';
import { CacheService } from '../cache/cache.service';
import { Duration } from '../common/app.constants';

@Injectable()
export class ConstantsService {
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly cacheService: CacheService,
  ) {}

  @Cacheable({
    key: () => 'movie-genres',
    ttl: Duration.ONE_MONTH,
  })
  async getMovieGenres(): Promise<Genre[]> {
    const list: TMDB_GenresList = await this.tmdbService.getMovieGenres();
    return list.genres.map((genre) => ({
      ...genre,
      emoji: getGenreEmoji(genre.id),
    }));
  }

  @Cacheable({
    key: () => 'tv-genres',
    ttl: Duration.ONE_MONTH,
  })
  async getSeriesGenres(): Promise<Genre[]> {
    const list: TMDB_GenresList = await this.tmdbService.getSeriesGenres();
    return list.genres.map((genre) => ({
      ...genre,
      emoji: getGenreEmoji(genre.id),
    }));
  }

  async getGenres(): Promise<GenresResDto> {
    const [movieGenres, seriesGenres] = await Promise.all([
      this.getMovieGenres(),
      this.getSeriesGenres(),
    ]);
    return {
      movieGenres,
      seriesGenres,
    };
  }
}
