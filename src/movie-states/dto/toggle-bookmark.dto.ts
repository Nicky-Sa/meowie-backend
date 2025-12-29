import { IsNotEmpty, IsNumber } from 'class-validator';

export class ToggleBookmarkReqDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

export class ToggleBookmarkResDto {
  bookmarked: boolean;
}
