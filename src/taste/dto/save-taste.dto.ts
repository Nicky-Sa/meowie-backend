import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
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
  AvoidId,
  CommitmentAnswer,
  EraAnswer,
  EXPLORE_LEVELS,
  GENRE_IDS,
  MAX_PICKED_TITLES,
  MIN_PICKED_MOVIES,
  RealityAnswer,
} from '@/taste/constants/journey.constant';
import { GenreId } from '@/taste/constants/pools.constant';
import { Personality } from '@/taste/constants/personality.constant';

export class SaveTasteReqDto {
  // TMDB ids of the picked titles. Not checked against the seed pools so a
  // live TMDB pool can replace them without touching this DTO — only the count
  // is limited.
  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(MIN_PICKED_MOVIES)
  @ArrayMaxSize(MAX_PICKED_TITLES)
  @ArrayUnique()
  movieIds: number[];

  @IsArray()
  @IsInt({ each: true })
  @ArrayMaxSize(MAX_PICKED_TITLES)
  @ArrayUnique()
  seriesIds: number[];

  @IsBoolean()
  seriesSkipped: boolean;

  @IsArray()
  @IsInt({ each: true })
  @IsIn(GENRE_IDS, {
    each: true,
    message: 'genreIds contains an unknown genre',
  })
  @ArrayMaxSize(GENRE_IDS.length)
  @ArrayUnique()
  genreIds: GenreId[];

  @IsString()
  @IsIn([...ANSWER_VALUES.era])
  era: EraAnswer;

  @IsString()
  @IsIn([...ANSWER_VALUES.reality])
  reality: RealityAnswer;

  @IsString()
  @IsIn([...ANSWER_VALUES.authority])
  authority: AuthorityAnswer;

  @IsString()
  @IsIn([...ANSWER_VALUES.commitment])
  commitment: CommitmentAnswer;

  @IsArray()
  @IsString({ each: true })
  @IsIn(AVOID_IDS, { each: true, message: 'avoid contains an unknown chip' })
  @ArrayMaxSize(AVOID_IDS.length)
  @ArrayUnique()
  avoid: AvoidId[];

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
  authority: AuthorityAnswer;
  commitment: CommitmentAnswer;
  avoid: AvoidId[];
  exploreLevel: number;
  personality: Personality;
};
