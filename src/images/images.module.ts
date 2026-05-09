import { Module } from '@nestjs/common';
import { ImagesService } from '@/images/images.service';

@Module({
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
