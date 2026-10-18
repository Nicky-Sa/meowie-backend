import { MediaType } from '@/types/media-type';

export type ExploreTabSources = Record<MediaType, string[]>;

export type ExploreTabPage = {
  sources: string[];
  page: number;
};
