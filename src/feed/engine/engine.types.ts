import { MediaType } from '@/types/media-type';
import { FeedProfile } from '@/feed/profile/profile.types';
import { TasteForFeed } from '@/taste/types/taste.type';
import { AvoidRules } from '@/feed/avoid.constant';

export type FeedCandidateSource = 'taste' | 'similar' | 'popular';

export type FeedCandidate = {
  id: number;
  mediaType: MediaType;
  genreIds: number[];
  voteAverage: number;
  voteCount: number;
  popularity: number;
  releaseYear: number | null;
  source: FeedCandidateSource;
};

export type FeedContext = {
  userId: number;
  mediaType: MediaType;
  profile: FeedProfile;
  taste: TasteForFeed;
  avoid: AvoidRules;
  excludeIds: Set<number>;
  served: Set<number>;
  shuffleSeed: number;
  nextTmdbPageToFetch: number;
};
