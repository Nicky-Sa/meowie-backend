import { Seed } from '@/feed/engine/engine.type';
import { LibraryItem } from '@/library/entities/library-item.entity';

export type LibrarySeedItem = Pick<
  LibraryItem,
  'tmdbId' | 'category' | 'rating' | 'createdAt'
>;

export type LibraryWeightModifier = (
  weight: number,
  item: LibrarySeedItem,
  now: Date,
) => number;

export type LibrarySourceInput = {
  libraryItems: LibrarySeedItem[];
  now: Date;
};

export type LibrarySourceOutput = Seed[];
