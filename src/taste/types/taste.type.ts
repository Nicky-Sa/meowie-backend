import { GenreId } from '@/taste/constants/pools.constant';
import {
  AuthorityAnswer,
  CommitmentAnswer,
  EraAnswer,
  RealityAnswer,
} from '@/taste/constants/journey.constant';

/**
 * Stored taste reduced to what the feed personalizes on. `hasTaste` is false
 * for users who never completed the wizard — the other fields then hold
 * neutral defaults (no genres, no avoids, balanced explore, null answers).
 */
export type TasteForFeed = {
  hasTaste: boolean;
  genreIds: GenreId[];
  movieIds: number[];
  seriesIds: number[];
  avoid: string[];
  exploreLevel: number;
  era: EraAnswer | null;
  reality: RealityAnswer | null;
  tasteAuthority: AuthorityAnswer | null;
  commitment: CommitmentAnswer | null;
};
