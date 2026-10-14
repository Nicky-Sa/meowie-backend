import { AvoidChip } from '@/taste/constants/journey.constant';
import { Title } from '@/taste/constants/pools.constant';

// Genres stay on the server to spread the deck across different genres.
export type JourneyTitle = Omit<Title, 'mainGenreId'>;

// Everything the app needs to run the taste wizard, fetched once on entry.
export type TasteJourneyResDto = {
  movies: JourneyTitle[];
  series: JourneyTitle[];
  avoidChips: readonly AvoidChip[];
  minMoviesToLike: number;
};
