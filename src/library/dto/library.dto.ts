import {
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { MediaType, MEDIA_TYPE_VALUES } from '@/types/media-type';
import {
  HIGHEST_RATING,
  LibraryCategory,
  LOWEST_RATING,
} from '@/library/constants/library.constants';
import { Page } from '@/common/types/media-query';
import { Rating } from '@/library/types/library.types';

export class RatingReqDto {
  // Skipping is sent as null, so the field always has to be there and the
  // checks below only apply to a real score.
  @ValidateIf((dto: RatingReqDto) => dto.rating !== null)
  @IsInt()
  @Min(LOWEST_RATING)
  @Max(HIGHEST_RATING)
  rating: Rating;
}

export type LibraryStatusResDto = Record<LibraryCategory, boolean> & {
  rating: Rating;
};

export class LibraryItemQueryDto extends Page {
  @IsEnum(MEDIA_TYPE_VALUES)
  @IsOptional()
  mediaType?: MediaType;
}
