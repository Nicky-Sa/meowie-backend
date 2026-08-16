import { LibrarySourceInput } from '@/feed/engine/1-seeds/library.types';
import { TasteSourceInput } from '@/feed/engine/1-seeds/taste.types';
import { Seed } from '@/feed/engine/engine.type';

export type SeedSource = {
  priority: number;
  items: Seed[];
};

export type SeedsStageInput = {
  tasteRatings: TasteSourceInput['tasteRatings'];
  libraryItems: LibrarySourceInput['libraryItems'];
  now?: Date; // it's being passed as an arg to keep the functions pure
};

export type SeedsStageOutput = {
  allSeeds: Seed[];
  positiveSeeds: Seed[];
  negativeSeeds: Seed[];
};
