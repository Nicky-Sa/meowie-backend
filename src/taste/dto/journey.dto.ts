import { AvoidChip, TasteQuestion } from '@/taste/constants/journey.constant';
import { GenreId, Title } from '@/taste/constants/pools.constant';

// The full genre list stays on the server — the app only needs the one genre a
// pick locks; the rest is read by the personality card.
export type JourneyTitle = Omit<Title, 'genreIds'>;

// Everything the app needs to run the taste wizard, fetched once on entry.
export type TasteJourneyResDto = {
  movies: JourneyTitle[];
  series: JourneyTitle[];
  genreIds: GenreId[];
  questions: readonly TasteQuestion[];
  avoidChips: readonly AvoidChip[];
  exploreLevels: readonly string[];
};
