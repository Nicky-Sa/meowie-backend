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

// The weight says how much they like it; below zero means they don't.
export type KnownTitle = {
  id: number;
  weight: number;
};

/** Who a request personalizes for; the same for every batch it builds. */
export type FeedInputs = {
  mediaType: MediaType;
  taste: TasteForFeed;
  likedTitles: KnownTitle[];
  // Titles TMDB recommends off the ones the user disliked. They lose score
  // rather than being blocked — a title can sit close to both sides.
  closeToDisliked: Set<number>;
  avoid: AvoidRules;
  excludeIds: Set<number>;
};

/** One build round: who it is for, plus where it got to. */
export type FeedContext = FeedInputs & {
  hiddenIds: Set<number>;
  shuffleSeed: number;
  nextTmdbPageToFetch: number;
};
