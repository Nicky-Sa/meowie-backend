import {
  IsArray,
  IsString,
  ArrayMinSize,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { KeywordId } from '@/taste/entities/taste.entity';

export class UpsertTasteReqDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
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
