import { Injectable } from '@nestjs/common';
import { FilterRequest, FilterResult } from '@/feed/engine/filter/filter.types';

export const FEED_FILTERS = Symbol('FEED_FILTERS');

@Injectable()
export abstract class FilterService {
  protected constructor() {}

  abstract name: string;
  abstract filter(request: FilterRequest): Promise<FilterResult>;
}
