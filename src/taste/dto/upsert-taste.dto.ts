import {
  IsArray,
  IsString,
  ArrayMinSize,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import { KeywordId } from '@/taste/entities/taste.entity';
import { TASTE_GENRES } from '@/constants/items/taste-keywords.constant';

const VALID_KEYWORD_IDS: string[] = TASTE_GENRES.flatMap((genre) =>
  genre.keywords.map((keyword) => keyword.id),
);

export class UpsertTasteReqDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsIn(VALID_KEYWORD_IDS, {
    each: true,
    message: 'keywords contains an invalid taste keyword',
  })
  keywords: KeywordId[];

  @IsInt()
  @Min(0)
  @Max(100)
  flexibility: number;
}

export type TasteResDto = {
  keywords: KeywordId[];
  flexibility: number;
};
