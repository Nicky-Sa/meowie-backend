import {
  AuthorityAnswer,
  AvoidId,
  CommitmentAnswer,
  EraAnswer,
  RealityAnswer,
  TitleRatings,
} from '@/taste/constants/journey.constant';

// A user who never finished the wizard reads as no ratings and 'both' answers.
export type TasteForFeed = {
  movieRatings: TitleRatings;
  seriesRatings: TitleRatings;
  avoid: AvoidId[];
  exploreLevel: number;
  era: EraAnswer;
  reality: RealityAnswer;
  authority: AuthorityAnswer;
  commitment: CommitmentAnswer;
};
