import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { TmdbModule } from '../tmdb/tmdb.module';
import { RatingsModule } from '../ratings/ratings.module';
import { ImagesModule } from '../images/images.module';

@Module({
  controllers: [MovieController],
  providers: [MovieService],
  imports: [TmdbModule, RatingsModule, ImagesModule],
  exports: [MovieService],
})
export class MovieModule {}
