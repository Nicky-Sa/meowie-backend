import { TitleAnswer, TitleRatings } from '@/taste/constants/journey.constant';

export const titleIdsMarkedAs = (
  ratings: TitleRatings,
  answer: TitleAnswer,
): number[] =>
  Object.entries(ratings)
    .filter(([, given]) => given === answer)
    .map(([tmdbId]) => Number(tmdbId));
