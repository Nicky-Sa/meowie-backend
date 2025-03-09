import { Controller, Get, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('ids')
  async getMovies(@Query('page') page: number = 1) {
    return await this.moviesService.getMovieIds(page);
  }
}
