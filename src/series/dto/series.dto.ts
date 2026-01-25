import { PaginatedResponse } from '../../models/paginated-results.model';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Browse, Filters, Page, Sort } from '../../movies/models/query.model';

export class InterestingSeriesIdsResDto extends PaginatedResponse<number> {
  @ApiProperty({ type: [Number] })
  declare results: number[];
}

export class QueryParamsDto extends IntersectionType(
  Browse,
  IntersectionType(Filters, IntersectionType(Page, Sort)),
) {}
