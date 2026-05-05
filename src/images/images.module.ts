import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ImagesService } from './images.service';
import { CacheModule } from '../cache/cache.module';
import { ImagesProcessor } from './images.processor';
import { IMAGE_QUEUE } from '../common/queue.constants';

@Module({
  imports: [
    CacheModule,
    BullModule.registerQueue({
      name: IMAGE_QUEUE.name,
    }),
  ],
  providers: [ImagesService, ImagesProcessor],
  exports: [ImagesService],
})
export class ImagesModule {}
