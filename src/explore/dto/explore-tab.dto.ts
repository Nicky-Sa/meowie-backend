import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { TMDB_MAX_PAGE } from '@/common/app.constants';

export class ExploreTabResDto {
  id: number;
  slug: string;
  title: string;
}

export class ExploreTabPageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(TMDB_MAX_PAGE)
  page?: number;
}
