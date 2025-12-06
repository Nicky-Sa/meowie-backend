import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis/redis.service';
import { CacheService } from './cache.service';

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
