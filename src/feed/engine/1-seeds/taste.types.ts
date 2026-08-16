import { Seed } from '@/feed/engine/engine.type';
import { TitleRatings } from '@/taste/constants/journey.constant';

export type TasteSourceInput = {
  tasteRatings: TitleRatings;
};

export type TasteSourceOutput = Seed[];
