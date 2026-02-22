import { PosterProps } from '../../images/poster';
import { CastInfo } from '../../types/cast';
import { Genre } from '../../constants/items/genres.constant';
import { RatingEntry } from '../../ratings/types/rating.type';
import { PaginatedResponse } from '../../common/types/paginated-response';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Browse, Filters, Page, Sort } from '../../common/types/media-query';

export class InterestingMovieIdsResDto extends PaginatedResponse<number> {
  @ApiProperty({ type: [Number] })
  declare results: number[];
}

export class QueryParamsDto extends IntersectionType(
  Browse,
  IntersectionType(Filters, IntersectionType(Page, Sort)),
) {}

export class MovieCredits {
  casts: CastInfo[];
  director: CastInfo;
}

// Combines MovieDetails and Ratings into one parent class
export class MovieInfoResDto {
  title: string;
  screeningStatus: string | null;
  duration: string;
  certification: string;
  trailerKey: string;
  posterPath: string;
  overview: string;
  genres: Genre[];
  posterProps: PosterProps;
  credits: MovieCredits;
  ratings: RatingEntry[];
}
