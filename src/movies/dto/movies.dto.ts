import { PosterProps } from '../models/image.model';
import { Credits, MoviePosterInfo } from '../models/movie-info.model';
import { Genre } from '../../constants/items/genres.constant';
import { RatingEntry } from '../models/ratings.model';
import { PaginatedResponse } from '../../models/paginated-results.model';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { Browse, Filters, Page, Sort } from '../models/query.model';

// Combines MovieDetails and AllRatings into one parent class
export class MovieInfoResDto {
  title: string;
  publishYear: string;
  duration: string;
  certification: string;
  trailerKey: string;
  posterPath: string;
  overview: string;
  genres: Genre[];
  posterProps: PosterProps;
  credits: Credits;
  ratings: RatingEntry[];
}

export class PurifiedMovieIdsResDto extends PaginatedResponse<number> {
  @ApiProperty({ type: [Number] })
  declare results: number[];
}

export class MoviePosterResDto extends PaginatedResponse<MoviePosterInfo> {
  @ApiProperty({ type: [MoviePosterInfo] })
  declare results: MoviePosterInfo[];
}

export class QueryParamsDto extends IntersectionType(
  Browse,
  IntersectionType(Filters, IntersectionType(Page, Sort)),
) {}
