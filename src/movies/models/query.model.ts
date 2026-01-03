import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class Browse {
  @IsOptional()
  @IsString()
  personId?: string;

  // You can easily add more properties here later
  // @IsOptional()
  // companyId?: string;
}

export class Filters {
  @IsOptional()
  @IsString()
  genres?: string;

  @IsOptional()
  @IsString()
  languages?: string;

  @IsOptional()
  @IsString()
  decade?: string;

  @IsOptional()
  @IsString()
  tmdbRatings?: string;
}

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
