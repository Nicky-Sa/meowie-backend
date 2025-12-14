import { Controller, Get, Param, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { QueryParams } from './models/query';
import { MovieIdsResDto, MovieInfoResDto } from './dto/movies.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('ids')
  async getMovieIds(@Query() query: QueryParams): Promise<MovieIdsResDto> {
    return this.moviesService.getMovieIds(query);
  }

  @Get('/info/:id')
  async getMovieInfo(@Param('id') id: number): Promise<MovieInfoResDto> {
    return this.moviesService.getMovieInfo(id);
  }
}
