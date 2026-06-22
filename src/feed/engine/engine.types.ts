import { MediaType } from '@/types/media-type';
import { FeedProfile } from '@/feed/profile/profile.types';
import { FlexibilityOptionId } from '@/taste/constants/flexibility-options.constant';

export type FeedCandidateSource = 'taste' | 'similar' | 'popular';

export type FeedCandidate = {
  id: number;
  mediaType: MediaType;
  genreIds: number[];
  voteAverage: number;
  voteCount: number;
  popularity: number;
  source: FeedCandidateSource;
};

export type FeedContext = {
  userId: number;
  mediaType: MediaType;
  profile: FeedProfile;
  flexibility: FlexibilityOptionId;
  excludeIds: Set<number>;
  served: Set<number>;
  shuffleSeed: number;
  nextTmdbPageToFetch: number;
};
