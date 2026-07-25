import { MediaType } from '@/types/media-type';

export type LibraryItemIdentifier = {
  tmdbId: number;
  mediaType: MediaType;
};

// null is a skipped rating.
export type Rating = number | null;
