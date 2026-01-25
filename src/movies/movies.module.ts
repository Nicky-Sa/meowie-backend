import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { MediaUtilsService } from '../media-utils/media-utils.service';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService, MediaUtilsService],
  exports: [MoviesService],
})
export class MoviesModule {}
