import { Global, Module } from '@nestjs/common';
import { ValkeyService } from './redis/valkey.service';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [
    {
      provide: CacheService, // abstract class as token
      useClass: ValkeyService, // concrete implementation
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
