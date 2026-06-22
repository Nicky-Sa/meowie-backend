import { PaginatedResponse } from '@/common/types/paginated-response';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { Page } from '@/common/types/media-query';

export class FeedQueryDto extends Page {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  refresh: boolean = false;
}

export class FeedResDto extends PaginatedResponse<number> {
  @ApiProperty({ type: [Number] })
  declare results: number[]; // TMDB_Ids
}
