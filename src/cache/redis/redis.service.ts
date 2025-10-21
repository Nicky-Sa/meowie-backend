// redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { CacheService } from '../cache.service';
import { EnvService } from '../../env/env.service';

@Injectable()
export class RedisService
  extends CacheService
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly env: EnvService) {
    super();
  }

  private client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: '127.0.0.1',
      port: this.env.get('REDIS_PORT'),
      tls: {
        servername: this.env.get('REDIS_ENDPOINT'),
      },
    });

    this.client.on('connect', () =>
      console.log('✅ Connected to ElastiCache Redis'),
    );
    this.client.on('error', (err) => console.error('❌ Redis Error:', err));
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
