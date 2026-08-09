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
  'tmdbId' | 'category' | 'rating'
>;

export type SeedsInput = {
  tasteRatings: TitleRatings;
  libraryItems: LibrarySeedItem[];
};

export type SeedsOutput = {
  allSeeds: Seed[];
  likedSeeds: Seed[];
  dislikedSeeds: Seed[];
};
