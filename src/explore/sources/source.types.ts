import { DateTime } from 'luxon';
import {
  TMDB_DiscoveredMovieDetail,
  TMDB_DiscoveredSeriesDetail,
} from '@/tmdb/tmdb.type';

export type SourcePlaceholderValues = {
  today: DateTime;
  country: string;
  language: string;
};

export type DiscoveredTitle =
  TMDB_DiscoveredMovieDetail | TMDB_DiscoveredSeriesDetail;

export type ExtraSourceFilter = {
  name: string;
  keepTitle: (title: DiscoveredTitle, limit: number) => boolean;
  cutsPagesWhenSortedBy: string;
};

export type ParsedExtraSourceFilter = {
  extraSourceFilter: ExtraSourceFilter;
  limit: number;
};
