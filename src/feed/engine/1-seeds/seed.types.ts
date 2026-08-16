import { LibraryItem } from '@/library/entities/library-item.entity';
import { TitleRatings } from '@/taste/constants/journey.constant';

export type Seed = {
  id: number;
  weight: number;
};

export type SeedList = {
  priority: number;
  items: Seed[];
};

export type LibrarySeedItem = Pick<
  LibraryItem,
  'tmdbId' | 'category' | 'rating' | 'createdAt'
>;

export type SeedsInput = {
  tasteRatings: TitleRatings;
  libraryItems: LibrarySeedItem[];
  now?: Date; // it's being passed as an arg to keep the functions pure
};

export type SeedsOutput = {
  allSeeds: Seed[];
  positiveSeeds: Seed[];
  negativeSeeds: Seed[];
};

export type LibraryWeightModifier = (
  weight: number,
  item: LibrarySeedItem,
  now: Date,
) => number;
