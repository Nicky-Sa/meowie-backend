import { TitleWithDetail } from '@/feed/engine/details/details.types';
import type { MarkedTitlesFilterService } from '@/feed/engine/filter/marked-titles/marked-titles.service';
import type { AvoidFilterService } from '@/feed/engine/filter/avoid/avoid.service';

export type FeedFilter = MarkedTitlesFilterService | AvoidFilterService;

export type FilterRequest = {
  userId: number;
  title: readonly TitleWithDetail[];
};

export type FilterResult = TitleWithDetail[];
