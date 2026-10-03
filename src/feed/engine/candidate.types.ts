import { MediaType } from '@/types/media-type';
import { TMDB_Genre, TMDB_Keyword } from '@/tmdb/tmdb.type';

export type Candidate = {
  id: number;
  mediaType: MediaType;
};

export type CandidateDetails = Candidate & {
  title: string;
  overview: string;
  year: number | null;
  genres: TMDB_Genre[];
  keywords: TMDB_Keyword[];
};
