import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';
import { CacheService } from '../cache.service';
import { EnvService } from '../../env/env.service';

@Injectable()
export class RedisService
  extends CacheService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger();

  constructor(private readonly env: EnvService) {
    super();
  }

  private client: Redis;

  onModuleInit() {
    this.client = new Redis(this.env.get('REDIS_ENDPOINT'));
    this.client.on('connect', () => this.logger.log('✅ Connected to Redis'));
    this.client.on('error', (err) => this.logger.error('❌ Redis Error:', err));
  }

  async set(key: string, value: unknown, ttlSeconds: number) {
    const stringValue = JSON.stringify(value); // Serialize
    await this.client.set(key, stringValue, 'EX', ttlSeconds);
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;

    try {
      return JSON.parse(data) as T; // Deserialize
    } catch (error) {
      this.logger.error(`Failed to parse cache for key ${key}`, error);
      return null;
    }
  }

  async del(key: string) {
    await this.client.del(key);
  }

  onModuleDestroy() {
    return this.client.quit();
  }
}
