import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  ANSWER_VALUES,
  AVOID_IDS,
  AuthorityAnswer,
  CommitmentAnswer,
  EraAnswer,
  EXPLORE_LEVELS,
  GENRE_IDS,
  RealityAnswer,
} from '@/taste/constants/journey.constant';
import { GenreId } from '@/taste/constants/pools.constant';
import { Personality } from '@/taste/personality';

export class SaveTasteReqDto {
  // TMDB ids of the picked titles. Not validated against the seed pools so a
  // live TMDB pool can replace them without touching this DTO.
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(4)
  movieIds: number[];

  @IsArray()
  @IsInt({ each: true })
  seriesIds: number[];

  @IsBoolean()
  seriesSkipped: boolean;

  @IsArray()
  @IsInt({ each: true })
  @IsIn(GENRE_IDS, {
    each: true,
    message: 'genreIds contains an unknown genre',
  })
  genreIds: GenreId[];

  @IsString()
  @IsIn([...ANSWER_VALUES.era])
  era: EraAnswer;

  @IsString()
  @IsIn([...ANSWER_VALUES.reality])
  reality: RealityAnswer;

  @IsString()
  @IsIn([...ANSWER_VALUES.tasteAuthority])
  tasteAuthority: AuthorityAnswer;

  @IsString()
  @IsIn([...ANSWER_VALUES.commitment])
  commitment: CommitmentAnswer;

  @IsArray()
  @IsString({ each: true })
  @IsIn(AVOID_IDS, { each: true, message: 'avoid contains an unknown chip' })
  avoid: string[];

  @IsInt()
  @Min(0)
  @Max(EXPLORE_LEVELS.length - 1)
  exploreLevel: number;
}

export type TasteResDto = {
  movieIds: number[];
  seriesIds: number[];
  seriesSkipped: boolean;
  genreIds: GenreId[];
  era: EraAnswer;
  reality: RealityAnswer;
  tasteAuthority: AuthorityAnswer;
  commitment: CommitmentAnswer;
  avoid: string[];
  exploreLevel: number;
  personality: Personality;
};
