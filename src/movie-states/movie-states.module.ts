import { Module } from '@nestjs/common';
import { MovieStatesService } from './movie-states.service';
import { MovieStatesController } from './movie-states.controller';
import { Saved } from './entities/saved.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesModule } from '../movies/movies.module';

@Module({
  imports: [TypeOrmModule.forFeature([Saved]), MoviesModule],
  controllers: [MovieStatesController],
  providers: [MovieStatesService],
})
export class MovieStatesModule {}
