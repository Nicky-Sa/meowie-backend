import { MediaType } from '@/types/media-type';

export const FEED_PAGE_SIZE = 20;
export const MAX_POOL_SIZE = 500;
export const MAX_FEED_PAGE = MAX_POOL_SIZE / FEED_PAGE_SIZE;

export const TASTE_LIKE_SEED_WEIGHT = 0.2;
export const TASTE_DISLIKE_SEED_WEIGHT = -0.2;
export const SAVED_SEED_WEIGHT = 0.5;
export const SEEN_UNRATED_SEED_WEIGHT = 0.1;
export const MAX_LIKED_SEEDS = 30;
export const MAX_DISLIKED_SEEDS = 10;

export const LIBRARY_SEED_PRIORITY = 1;
export const TASTE_SEED_PRIORITY = 2;

/**
 * taste.service.ts clears these keys when taste is saved, so both modules
 * must build them from this one place.
 */
export const feedCacheKeys = (userId: number, mediaType: MediaType) => {
  const base = `feed:${userId}:${mediaType}`;
  return {
    state: `${base}:state`,
    alreadyShown: `${base}:shown`,
  };
};

export type FeedCacheKeys = ReturnType<typeof feedCacheKeys>;
