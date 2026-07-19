import { GenreChip, TasteQuestion } from '@/taste/constants/journey.constant';
import { GenreId, Title } from '@/taste/constants/pools.constant';

// Everything the app needs to run the taste wizard, fetched once on entry.
export type TasteJourneyResDto = {
  movies: Title[];
  series: Title[];
  genreChips: GenreChip[];
  questions: TasteQuestion[];
  avoidChips: string[];
  exploreLevels: string[];
  rarityWeights: Record<GenreId, number>;
  autoSelectThreshold: number;
};
