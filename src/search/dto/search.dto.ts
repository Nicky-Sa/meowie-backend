import { MultiSearchResults } from '../models/search-results';

export type SearchReqQueryDto = {
  query: string;
};

export type MultiSearchResDto = MultiSearchResults[];
