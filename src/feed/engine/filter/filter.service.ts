import { Injectable } from '@nestjs/common';
import { FilterRequest, FilterResult } from '@/feed/engine/filter/filter.types';

@Injectable()
export abstract class FilterService {
  protected constructor() {}

  abstract name: string;
  abstract filter(request: FilterRequest): Promise<FilterResult>;
}
