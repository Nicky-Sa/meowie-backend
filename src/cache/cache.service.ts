import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class CacheService {
  protected constructor() {}

  abstract set(key: string, value: any, ttl?: number): Promise<void>;

  abstract get(key: string): Promise<string | null>;

  abstract del(key: string): Promise<void>;
}
