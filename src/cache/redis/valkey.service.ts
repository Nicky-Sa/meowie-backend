import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Valkey from 'ioredis';
import { CacheService } from '../cache.service';
import { EnvService } from '../../env/env.service';

@Injectable()
export class ValkeyService
  extends CacheService
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly env: EnvService) {
    super();
  }

  private client: Valkey;

  onModuleInit() {
    this.client = new Valkey({
      host: this.env.get('VALKEY_HOST'),
      port: this.env.get('VALKEY_PORT'),
      tls: {
        servername: this.env.get('VALKEY_ENDPOINT'),
      },
    });

    this.client.on('connect', () =>
      console.log('✅ Connected to ElastiCache Valkey'),
    );
    this.client.on('error', (err) => console.error('❌ Valkey Error:', err));
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
