import { JourneyTitle } from '@/taste/dto/journey.dto';
import { Title } from '@/taste/constants/pools.constant';

// Listed field by field so a new pool field can't reach the app by accident.
export const toJourneyTitle = ({
  title,
  year,
  genreIds,
  tmdbId,
  poster,
}: Title): JourneyTitle => ({ title, year, genreIds, tmdbId, poster });
