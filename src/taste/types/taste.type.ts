import {
  AuthorityAnswer,
  AvoidId,
  EraAnswer,
  TitleRatings,
} from '@/taste/constants/journey.constant';

// A user who never finished the wizard reads as no ratings and 'both' answers.
export type TasteForFeed = {
  movieRatings: TitleRatings;
  seriesRatings: TitleRatings;
  avoid: AvoidId[];
  exploreLevel: number;
  era: EraAnswer;
  authority: AuthorityAnswer;
};
