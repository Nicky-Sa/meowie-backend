import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { MediaType } from '../../types/media-type';
import {
  LIBRARY_CATEGORIES,
  LIBRARY_MEDIA_TYPES,
  LibraryCategory,
} from '../library.constants';
import { Page } from '../../common/types/media-query';

// Input DTO for toggling (create/delete)
export class ToggleLibraryItemReqDto {
  @IsInt()
  @IsNotEmpty()
  tmdbId: number;

  @IsEnum(LIBRARY_MEDIA_TYPES)
  @IsNotEmpty()
  mediaType: MediaType;

  @IsEnum(LIBRARY_CATEGORIES)
  @IsNotEmpty()
  category: LibraryCategory;
}

export type LibraryStatusResDto = Partial<Record<LibraryCategory, boolean>>;

export class LibraryItemQueryDto extends Page {}
