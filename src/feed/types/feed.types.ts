import { MediaType } from '@/types/media-type';
import { TasteForFeed } from '@/taste/types/taste.type';
import { AvoidRules } from '@/feed/constants/avoid.constant';

export type FeedCandidateSource = 'taste' | 'similar' | 'popular';

export type FeedCandidate = {
  id: number;
  genreIds: number[];
  voteAverage: number;
  voteCount: number;
  popularity: number;
  releaseYear: number | null;
  source: FeedCandidateSource;
};

/** A title the user likes — saved, well rated, or picked in the wizard. */
export type LikedTitle = {
  id: number;
  weight: number;
};

/** Who a request personalizes for; the same for every batch it builds. */
export type FeedInputs = {
  mediaType: MediaType;
  taste: TasteForFeed;
  likedTitles: LikedTitle[];
  avoid: AvoidRules;
  excludeIds: Set<number>;
};

/** One build round: who it is for, plus where it got to. */
export type FeedContext = FeedInputs & {
  hiddenIds: Set<number>;
  includeSimilar: boolean;
  shuffleSeed: number;
  nextTmdbPageToFetch: number;
};
