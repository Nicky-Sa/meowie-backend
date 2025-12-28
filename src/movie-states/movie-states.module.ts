import { Module } from '@nestjs/common';
import { MovieStatesService } from './movie-states.service';
import { MovieStatesController } from './movie-states.controller';
import { Bookmark } from './entities/bookmark.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark])],
  controllers: [MovieStatesController],
  providers: [MovieStatesService],
})
export class MovieStatesModule {}
