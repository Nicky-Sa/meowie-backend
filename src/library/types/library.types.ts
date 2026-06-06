import { MediaType } from '@/types/media-type';

export type LibraryItemIdentifier = {
  tmdbId: number;
  mediaType: MediaType;
};

export type Rating = number | undefined;
