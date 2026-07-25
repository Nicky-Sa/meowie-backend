import { AvoidChip, TasteQuestion } from '@/taste/constants/journey.constant';
import { GenreId, Title } from '@/taste/constants/pools.constant';

// hiddenGem stays on the server — only the personality card reads it.
export type JourneyTitle = Omit<Title, 'hiddenGem'>;

// Everything the app needs to run the taste wizard, fetched once on entry.
export type TasteJourneyResDto = {
  movies: JourneyTitle[];
  series: JourneyTitle[];
  genreIds: GenreId[];
  questions: readonly TasteQuestion[];
  avoidChips: readonly AvoidChip[];
  exploreLevels: readonly string[];
};
