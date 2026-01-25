import { PosterProps } from '../../models/image.model';
import { CastInfo, PosterInfo } from '../../models/info.model';
import { Genre } from '../../constants/items/genres.constant';
import { RatingEntry } from '../../models/ratings.model';
import { PaginatedResponse } from '../../models/paginated-results.model';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Browse, Filters } from '../models/query.model';
import { Page, Sort } from '../../models/shared-query.model';

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

// Combines MovieDetails and AllRatings into one parent class
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

export class MoviePosterResDto extends PaginatedResponse<PosterInfo> {
  @ApiProperty({ type: [PosterInfo] })
  declare results: PosterInfo[];
}
