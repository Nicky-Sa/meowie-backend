import { IsEnum, IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { MediaType, MEDIA_TYPE_VALUES } from '../../types/media-type';
import { LIBRARY_CATEGORIES, LibraryCategory } from '../library.constants';
import { Page } from '../../common/types/media-query';

// Input DTO for toggling (create/delete)
export class ToggleLibraryItemReqDto {
  @IsInt()
  @IsNotEmpty()
  tmdbId: number;

  @IsEnum(MEDIA_TYPE_VALUES)
  @IsNotEmpty()
  mediaType: MediaType;

  @IsEnum(LIBRARY_CATEGORIES)
  @IsNotEmpty()
  category: LibraryCategory;
}

export type LibraryStatusResDto = Partial<Record<LibraryCategory, boolean>>;

export class LibraryItemQueryDto extends Page {
  @IsEnum(MEDIA_TYPE_VALUES)
  @IsOptional()
  mediaType?: MediaType;
}
