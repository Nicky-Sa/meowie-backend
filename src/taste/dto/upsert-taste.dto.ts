import { IsArray, IsString, ArrayMinSize, IsIn } from 'class-validator';
import { KeywordId } from '@/taste/entities/taste.entity';
import { TASTE_GENRES } from '@/taste/constants/taste-keywords.constant';
import {
  FLEXIBILITY_OPTION_IDS,
  FlexibilityOptionId,
} from '@/taste/constants/flexibility-options.constant';

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

  @IsString()
  @IsIn(FLEXIBILITY_OPTION_IDS, {
    message: 'flexibility must be a valid option',
  })
  flexibility: string;
}

export type TasteResDto = {
  keywords: KeywordId[];
  flexibility: FlexibilityOptionId;
};
