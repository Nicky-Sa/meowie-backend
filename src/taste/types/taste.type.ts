import { GenreId } from '@/taste/constants/pools.constant';
import {
  AuthorityAnswer,
  AvoidId,
  CommitmentAnswer,
  EraAnswer,
  RealityAnswer,
} from '@/taste/constants/journey.constant';

/**
 * Stored taste reduced to what the feed personalizes on. A user who never
 * finished the wizard reads as empty lists and 'both' answers.
 */
export type TasteForFeed = {
  genreIds: GenreId[];
  movieIds: number[];
  seriesIds: number[];
  avoid: AvoidId[];
  exploreLevel: number;
  era: EraAnswer;
  reality: RealityAnswer;
  authority: AuthorityAnswer;
  commitment: CommitmentAnswer;
};
