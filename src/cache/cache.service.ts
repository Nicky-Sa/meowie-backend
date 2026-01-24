import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class CacheService {
  protected constructor() {}

  abstract set(key: string, value: unknown, ttl?: number): Promise<void>;

  abstract get<T>(key: string): Promise<T | null>;

  abstract del(key: string): Promise<void>;
}
