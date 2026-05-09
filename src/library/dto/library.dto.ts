import { IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { MediaType, MEDIA_TYPE_VALUES } from '@/types/media-type';
import { LibraryCategory } from '@/library/library.constants';
import { Page } from '@/common/types/media-query';

class LibraryItemIdentifier {
  @IsInt()
  @IsNotEmpty()
  tmdbId: number;

  @IsEnum(MEDIA_TYPE_VALUES)
  @IsNotEmpty()
  mediaType: MediaType;
}

export class MarkSavedReqDto extends LibraryItemIdentifier {}

export class RemoveItemReqDto extends LibraryItemIdentifier {}

export class MarkSeenReqDto extends LibraryItemIdentifier {
  @IsInt()
  @IsOptional()
  rating?: number;
}

export class UpdateRatingReqDto extends LibraryItemIdentifier {
  @IsInt()
  @IsOptional()
  rating?: number;
}

export type LibraryStatusResDto = Record<LibraryCategory, boolean> & {
  rating?: number | null;
};

export class LibraryItemQueryDto extends Page {
  @IsEnum(MEDIA_TYPE_VALUES)
  @IsOptional()
  mediaType?: MediaType;
}
