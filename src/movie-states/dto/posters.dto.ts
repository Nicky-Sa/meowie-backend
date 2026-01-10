import { IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum MovieStateKey {
  SAVED = 'saved',
  SEEN = 'seen',
}

export class PostersQueryDto {
  @IsEnum(MovieStateKey)
  movieState: MovieStateKey;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;
}
