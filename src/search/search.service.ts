import { Injectable } from '@nestjs/common';
import { TMDB_MultiSearchDetail } from '../tmdb/tmdb.type';
import { MultiSearchResDto } from './dto/search.dto';
import { getImage } from '../images/images.utils';
import { extractYearFromDate } from '../utils/dates';
import { MultiSearchResults } from './models/search-results.model';
import { TmdbService } from '../tmdb/tmdb.service';
import { ConstantsService } from '../constants/constants.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly tmdbService: TmdbService,
    private readonly constantsService: ConstantsService,
  ) {}

  async multiSearch(query: string): Promise<MultiSearchResDto> {
    if (!query) {
      return { results: [] };
    }
    const [response, genresRes] = await Promise.all([
      this.tmdbService.multiSearch(query),
      this.constantsService.getGenres(),
    ]);

    const { movieGenres, seriesGenres } = genresRes;
    const movieGenresMap = new Map(movieGenres.map((g) => [g.id, g.name]));
    const seriesGenresMap = new Map(seriesGenres.map((g) => [g.id, g.name]));

    const results: MultiSearchResults[] = response.results
      .filter(
        (result) =>
          result.media_type === 'person' ||
          result.media_type === 'movie' ||
          result.media_type === 'tv',
      )
      .filter((result) => this.isResultValid(result))
      .map((result) => {
        switch (result.media_type) {
          case 'person':
            return {
              mediaType: 'person' as const,
              id: result.id,
              name: result.name,
              knownForDepartment: result.known_for_department.toLowerCase(),
              profilePath: getImage(result.profile_path, 'person'),
            };
          case 'movie':
            return {
              mediaType: 'movie' as const,
              id: result.id,
              title: result.title,
              posterPath: getImage(result.poster_path, 'movie_poster'),
              genres: result.genre_ids
                .map((id) => movieGenresMap.get(id))
                .filter(Boolean) as string[],
              releaseYear: extractYearFromDate(result.release_date),
            };
          case 'tv':
            return {
              mediaType: 'series' as const,
              id: result.id,
              title: result.name,
              posterPath: getImage(result.poster_path, 'series_poster'),
              genres: result.genre_ids
                .map((id) => seriesGenresMap.get(id))
                .filter(Boolean) as string[],
              firstAirDate: extractYearFromDate(result.first_air_date),
            };
        }
      })
      .filter(Boolean);
    const matchingMovieGenres = movieGenres.filter((genre) =>
      genre.name.toLowerCase().includes(query.toLowerCase()),
    );
    const matchingSeriesGenres = seriesGenres.filter((genre) =>
      genre.name.toLowerCase().includes(query.toLowerCase()),
    );

    if (matchingMovieGenres.length > 0) {
      results.push(
        ...matchingMovieGenres.map((genre) => ({
          mediaType: 'movie-genre' as const,
          ...genre,
        })),
      );
    }
    if (matchingSeriesGenres.length > 0) {
      results.push(
        ...matchingSeriesGenres.map((genre) => ({
          mediaType: 'series-genre' as const,
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
      case 'tv':
        return Boolean(
          result.name && result.genre_ids.length > 0 && result.first_air_date,
        );
    }
    return false;
  }
}
