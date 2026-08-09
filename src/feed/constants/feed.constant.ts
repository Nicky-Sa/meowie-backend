import { MediaType } from '@/types/media-type';

export const FEED_PAGE_SIZE = 20;
export const MAX_POOL_SIZE = 500;
export const MAX_FEED_PAGE = MAX_POOL_SIZE / FEED_PAGE_SIZE;

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
