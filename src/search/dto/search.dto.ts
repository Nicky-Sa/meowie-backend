import { MultiSearchResults } from '../models/search-results.model';
import { IsString } from 'class-validator';

export class SearchReqQueryDto {
  @IsString()
  query: string;
}

export class MultiSearchResDto {
  results: MultiSearchResults[];
}
