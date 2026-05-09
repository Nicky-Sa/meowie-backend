import { Global, Module } from '@nestjs/common';
import { RedisService } from '@/cache/redis/redis.service';
import { CacheService } from '@/cache/cache.service';

@Global()
@Module({
  providers: [
    {
      provide: CacheService, // abstract class as token
      useClass: RedisService, // concrete implementation
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
