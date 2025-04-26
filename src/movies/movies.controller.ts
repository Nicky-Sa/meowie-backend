import { Controller, Get, Param, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { QueryParams } from './models/query';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('ids')
  async getMovieIds(@Query() query: QueryParams) {
    return await this.moviesService.getMovieIds(query);
  }

  @Get(':id')
  async getMovieInfo(@Param('id') id: number) {
    return await this.moviesService.getMovieInfo(id);
  }
}
