import { Controller, Get, Param, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('ids')
  async getMovieIds(@Query('page') page: number = 1) {
    return await this.moviesService.getMovieIds(page);
  }

  @Get(':id')
  async getMovieInfo(@Param('id') id: number) {
    return await this.moviesService.getMovieInfo(id);
  }
}
