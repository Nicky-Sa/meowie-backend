import { PaginatedResponse } from '@/common/types/paginated-response';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { Page } from '@/common/types/media-query';
import { MAX_FEED_PAGE } from '@/feed/constants/feed.constant';

export class FeedQueryDto extends Page {
  // The pool is capped, so pages past it hold nothing to serve.
  @Max(MAX_FEED_PAGE)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  refresh: boolean = false;
}

export class FeedResDto extends PaginatedResponse<number> {
  @ApiProperty({ type: [Number] })
  declare results: number[]; // TMDB_Ids
}
