import { IsOptional, IsString } from 'class-validator';

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
