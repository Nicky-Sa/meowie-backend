import { PaginatedResponse } from '../../models/paginated-results.model';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Browse, Filters } from '../../movies/models/query.model';
import { Genre } from '../../constants/items/genres.constant';
import { PosterProps } from '../../models/image.model';
import { CastInfo } from '../../models/info.model';
import { RatingEntry } from '../../models/ratings.model';
import { Page, Sort } from '../../models/shared-query.model';

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
