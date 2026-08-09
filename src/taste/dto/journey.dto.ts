import { AvoidChip, TasteQuestion } from '@/taste/constants/journey.constant';
import { Title } from '@/taste/constants/pools.constant';

// Genres stay on the server. The app shows posters and never names a genre, so
// only the cat card reads them.
export type JourneyTitle = Omit<Title, 'mainGenreId'>;

// Everything the app needs to run the taste wizard, fetched once on entry.
export type TasteJourneyResDto = {
  movies: JourneyTitle[];
  series: JourneyTitle[];
  questions: readonly TasteQuestion[];
  avoidChips: readonly AvoidChip[];
  exploreLevels: readonly string[];
  minMoviesToLike: number;
};
