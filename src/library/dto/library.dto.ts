import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { MediaType, MEDIA_TYPE_VALUES } from '@/types/media-type';
import { LibraryCategory } from '@/library/library.constants';
import { Page } from '@/common/types/media-query';
import { Rating } from '@/library/types/library.types';

export class RatingReqDto {
  @IsInt()
  @IsOptional()
  rating?: Rating;
}

export type LibraryStatusResDto = Record<LibraryCategory, boolean> & {
  rating?: number | null;
};

export class LibraryItemQueryDto extends Page {
  @IsEnum(MEDIA_TYPE_VALUES)
  @IsOptional()
  mediaType?: MediaType;
}
