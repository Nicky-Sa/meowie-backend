import { PosterProps } from '../../images/poster';
import { CreditInfo } from '../../types/credit';
import { Genre } from '../../constants/items/genres.constant';
import { RatingEntry } from '../../ratings/types/rating.type';
import { PaginatedResponse } from '../../common/types/paginated-response';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import {
  Browse,
  MovieFilters,
  Page,
  Sort,
} from '../../common/types/media-query';
import { WatchProviders } from '../../types/watch-provider';

export class InterestingMovieIdsResDto extends PaginatedResponse<number> {
  @ApiProperty({ type: [Number] })
  declare results: number[];
}

export class QueryParamsDto extends IntersectionType(
  Browse,
  IntersectionType(MovieFilters, IntersectionType(Page, Sort)),
) {}

export class MovieCredits {
  casts: CreditInfo[];
  crew: CreditInfo[];
  director: CreditInfo;
}

export class MovieInfoResDto {
  title: string;
  screeningStatus: string;
  duration: string;
  certification: string;
  trailerKey: string;
  posterPath: string;
  overview: string;
  genres: Genre[];
  posterProps: PosterProps;
  credits: MovieCredits;
  ratings: RatingEntry[];
  watchProviders: WatchProviders;
  ticketLink?: string;
}
