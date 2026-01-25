import { Module } from '@nestjs/common';
import { SeriesService } from './series.service';
import { SeriesController } from './series.controller';
import { MediaUtilsService } from '../media-utils/media-utils.service';

@Module({
  controllers: [SeriesController],
  providers: [SeriesService, MediaUtilsService],
})
export class SeriesModule {}
