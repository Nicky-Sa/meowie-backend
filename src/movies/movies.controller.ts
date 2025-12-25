import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { QueryParams } from './models/query';
import {
  PurifiedMovieIdsResDto,
  MovieInfoResDto,
  MoviePosterResDto,
} from './dto/movies.dto';
import { TMDBErrorInterceptor } from '../utils/tmdb-error.interceptor';

@Controller('movies')
@UseInterceptors(TMDBErrorInterceptor)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('purified-ids')
  async getPurifiedMovieIds(
    @Query() query: QueryParams,
  ): Promise<PurifiedMovieIdsResDto> {
    return this.moviesService.getPurifiedMovieIds(query);
  }

  @Get('/info/:id')
  async getMovieInfo(@Param('id') id: number): Promise<MovieInfoResDto> {
    return this.moviesService.getMovieInfo(id);
  }

  @Get('/poster')
  getPostersInBulk(@Query() query: QueryParams): Promise<MoviePosterResDto> {
    return this.moviesService.getMoviesPoster(query);
  }
}
