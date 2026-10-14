import { AvoidId, TitleRatings } from '@/taste/constants/journey.constant';

// A user who has not finished taste has no ratings or things to avoid.
export type TasteForFeed = {
  movieRatings: TitleRatings;
  seriesRatings: TitleRatings;
  avoid: AvoidId[];
};
