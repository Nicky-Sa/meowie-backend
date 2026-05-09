import { PaginatedResponse } from '@/common/types/paginated-response';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Browse, SeriesFilters, Page, Sort } from '@/common/types/media-query';
import { Genre } from '@/constants/items/genres.constant';
import { PosterProps } from '@/images/poster';
import { CreditInfo } from '@/types/credit';
import { RatingEntry } from '@/ratings/types/rating.type';
import { WatchProviders } from '@/types/watch-provider';

export class InterestingSeriesIdsResDto extends PaginatedResponse<number> {
  @ApiProperty({ type: [Number] })
  declare results: number[];
}

export class QueryParamsDto extends IntersectionType(
  Browse,
  IntersectionType(SeriesFilters, IntersectionType(Page, Sort)),
) {}

export class SeriesCredits {
  casts: CreditInfo[];
  crew: CreditInfo[];
  creator: CreditInfo;
}

export class SeriesInfoResDto {
  title: string;
  airingYears: string;
  seasonsText: string;
  contentRating: string;
  trailerKey: string;
  posterPath: string;
  overview: string;
  genres: Genre[];
  posterProps: PosterProps;
  credits: SeriesCredits;
  ratings: RatingEntry[];
  watchProviders: WatchProviders;
}
