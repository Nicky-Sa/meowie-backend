import { Title } from '@/feed/engine/engine.types';
import { TMDB_Genre, TMDB_Keyword } from '@/tmdb/tmdb.type';

export type TitleWithDetail = Title & {
  title: string;
  overview: string;
  year: number | null;
  genres: TMDB_Genre[];
  keywords: TMDB_Keyword[];
};

export type NullableTitleWithDetail = TitleWithDetail | null;

export type DetailsBatchRequest = Title[];

export type DetailsBatchResult = TitleWithDetail[];
