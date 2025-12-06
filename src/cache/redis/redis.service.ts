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

  async set(key: string, value: string, ttlSeconds = 300) {
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string) {
    await this.client.del(key);
  }

  onModuleDestroy() {
    return this.client.quit();
  }
}
