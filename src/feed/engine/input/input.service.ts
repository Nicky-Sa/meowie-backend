import { Injectable } from '@nestjs/common';
import { InputRequest } from '@/feed/engine/input/input.types';

export const FEED_INPUTS = Symbol('FEED_INPUTS');

@Injectable()
export abstract class InputService<TResult> {
  protected constructor() {}

  abstract name: string;
  abstract read(request: InputRequest): Promise<TResult>;
}
