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
  MIN_RATED_MOVIES,
  TITLE_ANSWERS,
  TitleAnswer,
  TitleRatings,
} from '@/taste/constants/journey.constant';
import { Personality } from '@/taste/constants/personality.constant';
import { MOVIE_IDS, SERIES_IDS } from '@/taste/constants/pools.constant';

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
  validate(ratings: unknown, args: ValidationArguments): boolean {
    const [poolIds] = args.constraints as [Set<number>];
    return (
      isTitleRatings(ratings) &&
      Object.keys(ratings).every((tmdbId) => poolIds.has(Number(tmdbId)))
    );
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must map ids from the taste deck to one of: ${TITLE_ANSWERS.join(', ')}`;
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
  // Only ids the deck actually serves are accepted, so replacing the pools with
  // a live source means this check has to follow.
  @Validate(AreTitleRatings, [MOVIE_IDS])
  @Validate(EnoughOpinions)
  movieRatings: TitleRatings;

  @Validate(AreTitleRatings, [SERIES_IDS])
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
