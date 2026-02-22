import { PaginatedResponse } from '../../common/types/paginated-response';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Browse, Filters, Page, Sort } from '../../common/types/media-query';
import { Genre } from '../../constants/items/genres.constant';
import { PosterProps } from '../../images/poster';
import { CastInfo } from '../../types/cast';
import { RatingEntry } from '../../ratings/types/rating.type';

export class InterestingSeriesIdsResDto extends PaginatedResponse<number> {
  @ApiProperty({ type: [Number] })
  declare results: number[];
}

export class QueryParamsDto extends IntersectionType(
  Browse,
  IntersectionType(Filters, IntersectionType(Page, Sort)),
) {}

export class SeriesCredits {
  casts: CastInfo[];
  creator: CastInfo;
}

export class SeriesInfoResDto {
  title: string;
  airingYears: `${string} - ${string}`;
  avgDuration: string;
  contentRating: string;
  trailerKey: string;
  posterPath: string;
  overview: string;
  genres: Genre[];
  posterProps: PosterProps;
  credits: SeriesCredits;
  ratings: RatingEntry[];
}
