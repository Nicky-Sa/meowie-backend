import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class Page {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;
}

export enum SortOption {
  POPULARITY = 'popularity.desc',
  RELEASE_DATE = 'primary_release_date.desc',
  RANDOM = 'random',
}

export class Sort {
  @IsOptional()
  @IsEnum(SortOption)
  sort: SortOption = SortOption.POPULARITY;
}
