import { Injectable } from '@nestjs/common';
import { SourceRequest, SourceResult } from '@/feed/engine/source/source.types';

@Injectable()
export abstract class SourceService {
  protected constructor() {}

  abstract name: string;
  abstract fetch(request: SourceRequest): Promise<SourceResult>;
}
