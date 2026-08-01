import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsString,
  Max,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  ANSWER_VALUES,
  AVOID_IDS,
  AuthorityAnswer,
  AvoidId,
  countOpinions,
  EraAnswer,
  EXPLORE_LEVELS,
  MAX_RATED_TITLES,
  MIN_RATED_MOVIES,
  TITLE_ANSWERS,
  TitleAnswer,
  TitleRatings,
} from '@/taste/constants/journey.constant';
import { Personality } from '@/taste/constants/personality.constant';

const isTitleRatings = (value: unknown): value is TitleRatings =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.entries(value).every(
    ([tmdbId, answer]) =>
      Number.isInteger(Number(tmdbId)) &&
      TITLE_ANSWERS.includes(answer as TitleAnswer),
  );

@ValidatorConstraint({ name: 'titleRatings' })
class AreTitleRatings implements ValidatorConstraintInterface {
  validate(ratings: unknown): boolean {
    return (
      isTitleRatings(ratings) && Object.keys(ratings).length <= MAX_RATED_TITLES
    );
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must map TMDB ids to one of: ${TITLE_ANSWERS.join(', ')}`;
  }
}

@ValidatorConstraint({ name: 'enoughOpinions' })
class EnoughOpinions implements ValidatorConstraintInterface {
  validate(ratings: unknown): boolean {
    return (
      isTitleRatings(ratings) && countOpinions(ratings) >= MIN_RATED_MOVIES
    );
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} needs at least ${MIN_RATED_MOVIES} titles marked liked or disliked`;
  }
}

export class SaveTasteReqDto {
  // TMDB ids are not checked against the seed pools, so a live pool can replace
  // them without touching this DTO — only the count is limited.
  @Validate(AreTitleRatings)
  @Validate(EnoughOpinions)
  movieRatings: TitleRatings;

  @Validate(AreTitleRatings)
  seriesRatings: TitleRatings;

  @IsString()
  @IsIn([...ANSWER_VALUES.era])
  era: EraAnswer;

  @IsString()
  @IsIn([...ANSWER_VALUES.authority])
  authority: AuthorityAnswer;

  @IsArray()
  @IsString({ each: true })
  @IsIn(AVOID_IDS, { each: true, message: 'avoid contains an unknown chip' })
  @ArrayMaxSize(AVOID_IDS.length)
  avoid: AvoidId[];

  @IsInt()
  @Min(0)
  @Max(EXPLORE_LEVELS.length - 1)
  exploreLevel: number;
}

export type TasteResDto = {
  movieRatings: TitleRatings;
  seriesRatings: TitleRatings;
  era: EraAnswer;
  authority: AuthorityAnswer;
  avoid: AvoidId[];
  exploreLevel: number;
  personality: Personality;
};
