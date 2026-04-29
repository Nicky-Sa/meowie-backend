import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ImagesService } from './images.service';
import { CacheModule } from '../cache/cache.module';
import { ImagesProcessor } from './images.processor';

@Module({
  imports: [
    CacheModule,
    BullModule.registerQueue({
      name: 'image',
    }),
  ],
  providers: [ImagesService, ImagesProcessor],
  exports: [ImagesService],
})
export class ImagesModule {}
