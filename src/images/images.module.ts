import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
