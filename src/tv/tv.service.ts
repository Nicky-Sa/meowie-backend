import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import {
  TMDB_DiscoverTvQuery,
  TMDB_DiscoveredTvDetail,
  TMDB_TvInfo,
  TMDB_DiscoveredTvList,
} from '../tmdb/tmdb.type';
import {
  InterestingTvIdsResDto,
  QueryParamsDto,
  TvCredits,
  TvInfoResDto,
} from './dto/tv.dto';
import { Cacheable } from '../cache/cacheable.decorator';
import { SortOption } from '../common/types/media-query';
import { getImage, mapToPosters } from '../images/images.utils';
import { CastInfo } from '../types/cast';
import { TmdbService } from '../tmdb/tmdb.service';
import { ImagesService } from '../images/images.service';
import { RatingsService } from '../ratings/ratings.service';
import {
  findTrailerKey,
  formatCasts,
  formatGenres,
  emptyCast,
} from '../utils/media';
import { CacheDuration } from '../cache/cache.constants';
import { PosterResDto } from '../common/dto/poster.dto';

@Injectable()
export class TvService {
  constructor(
    private readonly tmdb: TmdbService,
    private readonly cacheService: CacheService,
    private readonly ratingsService: RatingsService,
    private readonly imagesService: ImagesService,
  ) {}

  async getDiscoveredTv(
    query: QueryParamsDto,
    tmdbQuery?: TMDB_DiscoverTvQuery,
  ): Promise<TMDB_DiscoveredTvList> {
    const response = await this.tmdb.getDiscover<
      TMDB_DiscoveredTvList,
      TMDB_DiscoverTvQuery
    >('tv', {
      sort_by: this.constructSort(query.sort),
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
        'vote_average.gte': Number(query.tmdbRatings.split(',')[0]),
        'vote_average.lte': Number(query.tmdbRatings.split(',')[1]),
      }),
      page: query.page ?? 1,
      ...tmdbQuery,
    });

    const validTv = response.results.filter((tvShow) => this.isTvValid(tvShow));
    return {
      ...response,
      results: validTv,
    };
  }

  async getInterestingTvIds(
    query: Pick<QueryParamsDto, 'page' | 'sort'>,
  ): Promise<InterestingTvIdsResDto> {
    const discoveredTv = await this.getDiscoveredTv(query, {
      'vote_count.gte': 50,
    });

    const data = {
      ...discoveredTv,
      results: discoveredTv.results.map((tvShow) => tvShow.id),
    };

    return data;
  }

  @Cacheable({
    key: (id: number, append_to_response = '') =>
      `tv-basic-info-${id}-{${append_to_response}}`,
    ttl: CacheDuration.ONE_DAY,
  })
  async getBasicTvInfo<T>(
    id: number,
    append_to_response: string = '',
  ): Promise<T> {
    return this.tmdb.getDetails<T>('tv', id, append_to_response);
  }

  @Cacheable({
    key: (id: number) => `tv-info-${id}`,
    ttl: CacheDuration.ONE_DAY,
  })
  async getTvInfo(id: number): Promise<TvInfoResDto> {
    const item = await this.getBasicTvInfo<TMDB_TvInfo>(
      id,
      'videos,content_ratings,credits',
    );
    const posterPath = getImage(item.poster_path, 'poster');
    const posterProps =
      await this.imagesService.generatePosterProps(posterPath);
    const ratings = await this.ratingsService.getRatings(
      'tvshow',
      id,
      item.vote_average,
    );

    const data: TvInfoResDto = {
      title: item.name,
      airingYears: this.constructAiringYears(
        item.first_air_date,
        item.last_air_date,
        item.status,
      ),
      avgDuration: `${item.episode_run_time[0] || 'N/A'} min`,
      contentRating: this.findContentRating(item.content_ratings),
      trailerKey: findTrailerKey(item.videos),
      posterPath,
      overview: item.overview,
      genres: formatGenres(item.genres),
      posterProps,
      credits: this.constructTvCredits(item.credits, item.created_by),
      ratings,
    };
    return data;
  }

  getTvPosters(tvList: TMDB_DiscoveredTvList): PosterResDto {
    const { results: tvShows, ...rest } = tvList;
    return { results: mapToPosters(tvShows, 'tv'), ...rest };
  }

  private isTvValid(tvShow: TMDB_DiscoveredTvDetail): boolean {
    return Boolean(tvShow.name && tvShow.overview);
  }

  private constructTvCredits(
    credits: TMDB_TvInfo['credits'],
    createdBy: TMDB_TvInfo['created_by'],
  ): TvCredits {
    return {
      casts: formatCasts(credits.cast),
      creator: this.formatCreator(createdBy),
    };
  }

  private formatCreator(createdBy: TMDB_TvInfo['created_by']): CastInfo {
    const creator = createdBy[0];
    if (!creator) {
      return emptyCast;
    }
    return {
      id: creator.id,
      name: creator.name,
      character: 'Creator',
      creditId: creator.credit_id,
      profilePath: getImage(creator.profile_path, 'person'),
    };
  }

  private findContentRating(
    contentRatings: TMDB_TvInfo['content_ratings'],
    country: string = 'US',
  ) {
    return (
      contentRatings.results.find((result) => result.iso_3166_1 === country)
        ?.rating || 'N/A'
    );
  }

  private constructAiringYears(
    firstAirDate: string,
    lastAirDate: string,
    status: TMDB_TvInfo['status'],
  ): `${string} - ${string}` {
    if (status === 'Returning Series') {
      return `${firstAirDate.slice(0, 4)} - Present`;
    }
    return `${firstAirDate.slice(0, 4)} - ${lastAirDate.slice(0, 4)}`;
  }

  private constructSort(sort: SortOption) {
    switch (sort) {
      case SortOption.RANDOM:
        return 'vote_count.desc';
      case SortOption.NEWEST:
        return 'first_air_date.desc';
      case SortOption.POPULARITY:
        return 'popularity.desc';
      default:
        return sort;
    }
  }
}
