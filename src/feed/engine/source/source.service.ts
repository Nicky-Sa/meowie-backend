import { Injectable } from '@nestjs/common';
import { SourceRequest, SourceResult } from '@/feed/engine/source/source.types';

export const FEED_SOURCES = Symbol('FEED_SOURCES');

@Injectable()
export abstract class SourceService<
  TRequest extends SourceRequest<unknown>,
  TResult extends SourceResult<unknown>,
> {
  protected constructor() {}

  abstract name: string;
  abstract fetch(request: TRequest): Promise<TResult>;
}
