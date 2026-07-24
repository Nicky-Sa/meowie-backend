import { TasteQuestion } from '@/taste/constants/journey.constant';
import { GenreId, Title } from '@/taste/constants/pools.constant';

// hiddenGem stays on the server — only the personality card reads it.
export type JourneyTitle = Omit<Title, 'hiddenGem'>;

export const toJourneyTitle = (title: Title): JourneyTitle => ({
  title: title.title,
  year: title.year,
  genreIds: title.genreIds,
  tmdbId: title.tmdbId,
  poster: title.poster,
});

// Everything the app needs to run the taste wizard, fetched once on entry.
export type TasteJourneyResDto = {
  movies: JourneyTitle[];
  series: JourneyTitle[];
  genreIds: GenreId[];
  questions: TasteQuestion[];
  avoidChips: string[];
  exploreLevels: string[];
};
