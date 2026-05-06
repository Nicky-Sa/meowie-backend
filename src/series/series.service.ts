import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import {
  TMDB_DiscoverSeriesQuery,
  TMDB_DiscoveredSeriesDetail,
  TMDB_SeriesInfo,
  TMDB_DiscoveredSeriesList,
} from '../tmdb/tmdb.type';
import {
  InterestingSeriesIdsResDto,
  QueryParamsDto,
  SeriesCredits,
  SeriesInfoResDto,
} from './dto/series.dto';
import { Cacheable } from '../cache/cacheable.decorator';
import { getImage } from '../images/images.utils';
import { CreditInfo } from '../types/credit';
import { TmdbService } from '../tmdb/tmdb.service';
import { ImagesService } from '../images/images.service';
import { RatingsService } from '../ratings/ratings.service';
import {
  findTrailerKey,
  formatCasts,
  formatCrew,
  formatGenres,
  emptyCredit,
} from '../utils/media';
import { PosterResDto } from '../common/dto/poster.dto';
import { Duration } from '../common/app.constants';
import { extractYearFromDate } from '../utils/dates';
import { GENRES } from '../constants/items/genres.constant';
import { BaseMediaService } from '../common/base-media.service';

@Injectable()
export class SeriesService extends BaseMediaService {
  protected readonly mediaType = 'series' as const;
  protected readonly tmdbMediaType = 'tv' as const;

  constructor(
    tmdbService: TmdbService,
    private readonly cacheService: CacheService,
    private readonly ratingsService: RatingsService,
    private readonly imagesService: ImagesService,
  ) {
    super(tmdbService);
  }

  async getDiscoveredSeries(
    query: QueryParamsDto,
    tmdbQuery?: TMDB_DiscoverSeriesQuery,
  ): Promise<TMDB_DiscoveredSeriesList> {
    const params = this.constructDiscoveryParams(
      query,
      'first_air_date',
      tmdbQuery,
    );

    const response = await this.tmdbService.getDiscover<
      TMDB_DiscoveredSeriesList,
      TMDB_DiscoverSeriesQuery
    >('series', {
      ...params,
      ...(query.format === 'miniseries' && {
        with_type: '2',
      }),
      ...(query.format === 'multiple-seasons' && {
        with_type: `0|1|3|4|5|6`,
      }),
    });

    const validSeries = response.results.filter((tvShow) =>
      this.isSeriesValid(tvShow),
    );
    return {
      ...response,
      results: validSeries,
    };
  }

  async getInterestingSeriesIds(
    query: Pick<QueryParamsDto, 'page' | 'sort'>,
  ): Promise<InterestingSeriesIdsResDto> {
    return await this.getInterestingIdsBase(() =>
      this.getDiscoveredSeries(query, {
        'vote_count.gte': 50,
      }),
    );
  }

  async getBasicSeriesInfo<T>(
    id: number,
    append_to_response: string = '',
  ): Promise<T> {
    return await this.tmdbService.getDetails<T>(
      'series',
      id,
      append_to_response,
    );
  }

  @Cacheable({
    key: (id: number, country: string) => `series-info-${id}-${country}`,
    ttl: Duration.ONE_DAY,
  })
  async getSeriesInfo(id: number, country: string): Promise<SeriesInfoResDto> {
    const item = await this.getBasicSeriesInfo<TMDB_SeriesInfo>(
      id,
      'videos,content_ratings,credits,watch/providers',
    );
    const posterPath = getImage(item.poster_path, 'series_poster');
    const [blurhash, primaryColorHex] = await Promise.all([
      this.imagesService.generateRealBlurhash({ imageUrl: posterPath }),
      this.imagesService.generatePrimaryColorHex(posterPath),
    ]);
    const posterProps = { blurhash, primaryColorHex };
    const ratings = await this.ratingsService.getRatings(
      'tvshow',
      id,
      item.vote_average,
    );

    const data: SeriesInfoResDto = {
      title: item.name,
      airingYears: this.constructAiringYears(
        item.first_air_date,
        item.last_air_date,
        item.status,
      ),
      seasonsText: this.constructSeasons(item.number_of_seasons),
      contentRating: this.findContentRating(item.content_ratings, country),
      trailerKey: findTrailerKey(item.videos),
      posterPath,
      overview: item.overview,
      genres: formatGenres(item.genres),
      posterProps,
      credits: this.constructSeriesCredits(item.credits, item.created_by),
      ratings,
      watchProviders: this.constructWatchProviders(
        id,
        item['watch/providers'],
        country,
      ),
    };
    return data;
  }

  async getSeriesPosters(query: QueryParamsDto): Promise<PosterResDto> {
    const discoveredSeriesList = await this.getDiscoveredSeries(query);
    const { results: series, ...rest } = discoveredSeriesList;
    const results = series.map((tvShow) => this.mapToSeriesPoster(tvShow));
    return { results, ...rest };
  }

  private constructSeasons(numberOfSeasons: number): string {
    return `${numberOfSeasons} Season${numberOfSeasons === 1 ? '' : 's'}`;
  }

  @Cacheable({
    key: (id: number, page: number = 1) =>
      `series-recommendations-${id}-p${page}`,
    ttl: Duration.ONE_DAY,
  })
  async getSeriesRecommendations(
    id: number,
    page: number = 1,
  ): Promise<PosterResDto> {
    return await this.getRecommendationsBase<TMDB_DiscoveredSeriesDetail>(
      id,
      page,
      (series) => this.mapToSeriesPoster(series),
    );
  }

  private mapToSeriesPoster(series: TMDB_DiscoveredSeriesDetail) {
    const posterPath = getImage(series.poster_path, 'series_poster');
    const blurhash = this.imagesService.generatePlaceholderBlurhash({
      id: series.id,
    });

    return {
      id: series.id,
      posterPath,
      blurhash,
      mediaType: 'series' as const,
      preview: {
        title: series.name,
        overview: series.overview,
        genres: GENRES.filter((genre) => series.genre_ids.includes(genre.id)),
      },
    };
  }

  private isSeriesValid(tvShow: TMDB_DiscoveredSeriesDetail): boolean {
    return Boolean(tvShow.name && tvShow.overview && tvShow.first_air_date);
  }

  private constructSeriesCredits(
    credits: TMDB_SeriesInfo['credits'],
    createdBy: TMDB_SeriesInfo['created_by'],
  ): SeriesCredits {
    return {
      casts: formatCasts(credits.cast),
      crew: formatCrew(credits.crew),
      creator: this.formatCreator(createdBy),
    };
  }

  private formatCreator(createdBy: TMDB_SeriesInfo['created_by']): CreditInfo {
    const creator = createdBy[0];
    if (!creator) {
      return emptyCredit;
    }
    return {
      id: creator.id,
      name: creator.name,
      role: 'Creator',
      creditId: creator.credit_id,
      profilePath: getImage(creator.profile_path, 'person'),
    };
  }

  private findContentRating(
    contentRatings: TMDB_SeriesInfo['content_ratings'],
    country: string,
  ) {
    return (
      contentRatings.results.find((result) => result.iso_3166_1 === country)
        ?.rating || 'N/A'
    );
  }

  private constructAiringYears(
    firstAirDate: string,
    lastAirDate: string | null,
    status: TMDB_SeriesInfo['status'],
  ): string {
    if (status === 'Returning Series') {
      if (firstAirDate) {
        return `${extractYearFromDate(firstAirDate)} - Now`;
      }
    }
    if (lastAirDate) {
      const startYear = extractYearFromDate(firstAirDate);
      const endYear = extractYearFromDate(lastAirDate);
      if (startYear === endYear) {
        return startYear;
      }
      return `${startYear} - ${endYear}`;
    }
    return `N/A`;
  }
}
