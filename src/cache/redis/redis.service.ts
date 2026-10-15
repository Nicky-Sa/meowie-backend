import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';
import { CacheService } from '@/cache/cache.service';
import { EnvService } from '@/env/env.service';

@Injectable()
export class RedisService
  extends CacheService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly env: EnvService) {
    super();
  }

  private client: Redis;

  onModuleInit() {
    this.client = new Redis(this.env.get('REDIS_ENDPOINT'));
    this.client.on('connect', () => this.logger.log('✅ Connected to Redis'));
    this.client.on('error', (err) => this.logger.error('❌ Redis Error:', err));
  }

  async set(
    key: string,
    value: unknown,
    ttlSeconds: number,
    options?: { onlyIfAbsent?: boolean },
  ): Promise<boolean> {
    const stringValue = JSON.stringify(value);
    const result = options?.onlyIfAbsent
      ? await this.client.set(key, stringValue, 'EX', ttlSeconds, 'NX')
      : await this.client.set(key, stringValue, 'EX', ttlSeconds);
    return result === 'OK';
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

  async setIfIdMatches(
    key: string,
    value: unknown,
    ttlSeconds: number,
    id: { field: string; expected: string },
  ): Promise<boolean> {
    const result = await this.client.eval(
      `
        local current = redis.call('GET', KEYS[1])
        if not current then return 0 end

        local cached = cjson.decode(current)
        if type(cached) ~= 'table' or cached[ARGV[1]] ~= ARGV[2] then
          return 0
        end

        redis.call('SET', KEYS[1], ARGV[3], 'EX', ARGV[4])
        return 1
      `,
      1,
      key,
      id.field,
      id.expected,
      JSON.stringify(value),
      ttlSeconds,
    );
    return result === 1;
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async sadd(key: string, value: string) {
    await this.client.sadd(key, value);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async onModuleDestroy() {
    this.logger.log('Gracefully closing Redis connection...');
    if (this.client && this.client.status !== 'end') {
      await this.client.quit();
    }
  }
}
