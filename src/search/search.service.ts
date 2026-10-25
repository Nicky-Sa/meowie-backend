import { Injectable, Logger } from '@nestjs/common';
import { TMDB_MultiSearchDetail } from '@/tmdb/tmdb.type';
import { MultiSearchResDto } from '@/search/dto/search.dto';
import { getImageWithFallback } from '@/images/images.utils';
import { extractYearFromDate } from '@/utils/dates';
import { appMediaTypeToTmdbMediaType } from '@/utils/media';
import { MultiSearchResults } from '@/search/models/search-results.model';
import {
  aiSearchAnswerSchema,
  AiSearchMatch,
} from '@/search/models/ai-search-match.model';
import {
  AI_SEARCH_MAX_MATCHES,
  AI_SEARCH_PROMPT,
  AI_SEARCH_TIMEOUT_MS,
  CLOSE_MATCH_RESULT_COUNT,
} from '@/search/search.constants';
import { hasCloseMatch } from '@/search/search.utils';
import { TmdbService } from '@/tmdb/tmdb.service';
import { ConstantsService } from '@/constants/constants.service';
import { GenresResDto } from '@/constants/constants.dto';
import { Genre } from '@/constants/items/genres.constant';
import { AiService } from '@/ai/ai.service';
import { CacheService } from '@/cache/cache.service';
import { Cacheable } from '@/cache/cacheable.decorator';
import { Duration } from '@/common/app.constants';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly tmdbService: TmdbService,
    private readonly constantsService: ConstantsService,
    private readonly aiService: AiService,
    private readonly cacheService: CacheService,
  ) {}

  async multiSearch(query: string): Promise<MultiSearchResDto> {
    if (!query) {
      return { results: [], isAiResult: false };
    }

    const [tmdbResponse, genresRes] = await Promise.all([
      this.tmdbService.multiSearch(query),
      this.constantsService.getGenres(),
    ]);

    const { movieGenres, seriesGenres } = genresRes;
    const movieGenresMap = new Map(movieGenres.map((g) => [g.id, g.name]));
    const seriesGenresMap = new Map(seriesGenres.map((g) => [g.id, g.name]));

    // reading desired tmdb search results
    const tmdbItems = tmdbResponse.results
      .filter(
        (result) =>
          result.media_type === 'person' ||
          result.media_type === 'movie' ||
          result.media_type === 'tv',
      )
      .filter((result) => this.isResultValid(result));

    const results: MultiSearchResults[] = tmdbItems.map((result) =>
      this.mapTmdbItemToSearchResult(result, movieGenresMap, seriesGenresMap),
    );

    // genre search
    const genreResults = this.mapGenresToSearchResults(query, genresRes);
    results.push(...genreResults);

    const hasCloseTmdbItem = hasCloseMatch(
      query,
      tmdbItems
        .slice(0, CLOSE_MATCH_RESULT_COUNT)
        .flatMap((result) => this.getTmdbItemNames(result)),
    );
    if (genreResults.length > 0 || hasCloseTmdbItem) {
      return { results, isAiResult: false };
    }

    try {
      const aiMatches = await this.findAiMatches(query);
      const aiResults = await this.findAiMatchResults(
        aiMatches,
        movieGenresMap,
        seriesGenresMap,
      );
      if (aiResults.length === 0) {
        return { results, isAiResult: false };
      }
      return { results: aiResults, isAiResult: true };
    } catch (error) {
      this.logger.error('AI search failed', error);
      return { results, isAiResult: false };
    }
  }

  @Cacheable({
    key: (query: string) => `ai-search-${query.trim().toLowerCase()}`,
    ttl: Duration.ONE_DAY,
  })
  private async findAiMatches(query: string): Promise<AiSearchMatch[]> {
    const { matches } = await this.aiService.ask({
      instructions: AI_SEARCH_PROMPT,
      prompt: query,
      schema: aiSearchAnswerSchema,
      timeoutMs: AI_SEARCH_TIMEOUT_MS,
    });

    return matches.slice(0, AI_SEARCH_MAX_MATCHES);
  }

  private async findAiMatchResults(
    matches: AiSearchMatch[],
    movieGenresMap: Map<number, string>,
    seriesGenresMap: Map<number, string>,
  ): Promise<MultiSearchResults[]> {
    const foundResults = await Promise.all(
      matches.map((match) => this.findAiMatchOnTmdb(match)),
    );

    // Two AI matches can be the same title, like "Money Heist" and "La casa de papel".
    return foundResults
      .filter((result) => result !== undefined)
      .filter(
        (result, index, allResults) =>
          allResults.findIndex(
            (other) =>
              other.id === result.id && other.media_type === result.media_type,
          ) === index,
      )
      .map((result) =>
        this.mapTmdbItemToSearchResult(result, movieGenresMap, seriesGenresMap),
      );
  }

  private async findAiMatchOnTmdb(match: AiSearchMatch) {
    const tmdbMediaType =
      match.mediaType === 'person'
        ? 'person'
        : appMediaTypeToTmdbMediaType(match.mediaType);
    const { results } = await this.tmdbService.multiSearch(match.name);
    const sameTypeResults = results.filter(
      (result) =>
        result.media_type === tmdbMediaType && this.isResultValid(result),
    );

    return (
      sameTypeResults.find(
        (result) =>
          match.year !== null &&
          this.getReleaseYear(result) === String(match.year),
      ) ?? sameTypeResults[0]
    );
  }

  private getTmdbItemNames(result: TMDB_MultiSearchDetail) {
    switch (result.media_type) {
      case 'person':
        return [result.name, result.original_name];
      case 'movie':
        return [result.title, result.original_title];
      case 'tv':
        return [result.name, result.original_name];
    }
  }

  private getReleaseYear(result: TMDB_MultiSearchDetail) {
    switch (result.media_type) {
      case 'person':
        return null;
      case 'movie':
        return extractYearFromDate(result.release_date);
      case 'tv':
        return extractYearFromDate(result.first_air_date);
    }
  }

  private mapTmdbItemToSearchResult(
    result: TMDB_MultiSearchDetail,
    movieGenresMap: Map<number, string>,
    seriesGenresMap: Map<number, string>,
  ): MultiSearchResults {
    switch (result.media_type) {
      case 'person':
        return {
          mediaType: 'person' as const,
          id: result.id,
          name: result.name,
          knownForDepartment: result.known_for_department.toLowerCase(),
          profilePath: getImageWithFallback(result.profile_path, 'person'),
        };
      case 'movie':
        return {
          mediaType: 'movie' as const,
          id: result.id,
          title: result.title,
          posterPath: getImageWithFallback(result.poster_path, 'movie_poster'),
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
          posterPath: getImageWithFallback(result.poster_path, 'series_poster'),
          genres: result.genre_ids
            .map((id) => seriesGenresMap.get(id))
            .filter(Boolean) as string[],
          firstAirDate: extractYearFromDate(result.first_air_date),
        };
    }
  }

  private mapGenresToSearchResults(
    query: string,
    { movieGenres, seriesGenres }: GenresResDto,
  ): MultiSearchResults[] {
    const isMatch = (genre: Genre) =>
      genre.name.toLowerCase().includes(query.toLowerCase());

    return [
      ...movieGenres
        .filter(isMatch)
        .map((genre) => ({ mediaType: 'movie-genre' as const, ...genre })),
      ...seriesGenres
        .filter(isMatch)
        .map((genre) => ({ mediaType: 'series-genre' as const, ...genre })),
    ];
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
  }
}
