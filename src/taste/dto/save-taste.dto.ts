import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsString,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  AVOID_IDS,
  AvoidId,
  MIN_MOVIES_TO_LIKE,
  TITLE_ANSWERS,
  TitleAnswer,
  TitleRatings,
} from '@/taste/constants/journey.constant';
import { MOVIE_IDS, SERIES_IDS } from '@/taste/constants/pools.constant';
import { titleIdsMarkedAs } from '@/taste/utils/taste.utils';

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

@ValidatorConstraint({ name: 'enoughLikes' })
class EnoughLikes implements ValidatorConstraintInterface {
  validate(ratings: unknown): boolean {
    return (
      isTitleRatings(ratings) &&
      titleIdsMarkedAs(ratings, 'like').length >= MIN_MOVIES_TO_LIKE
    );
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} needs at least ${MIN_MOVIES_TO_LIKE} titles marked liked`;
  }
}

export class SaveTasteReqDto {
  // Only ids the deck actually serves are accepted, so replacing the pools with
  // a live source means this check has to follow.
  @Validate(AreTitleRatings, [MOVIE_IDS])
  @Validate(EnoughLikes)
  movieRatings: TitleRatings;

  @Validate(AreTitleRatings, [SERIES_IDS])
  seriesRatings: TitleRatings;

  @IsArray()
  @IsString({ each: true })
  @IsIn(AVOID_IDS, { each: true, message: 'avoid contains an unknown chip' })
  @ArrayMaxSize(AVOID_IDS.length)
  avoid: AvoidId[];
}

export class SaveTasteResDto {
  successful: boolean;
}
