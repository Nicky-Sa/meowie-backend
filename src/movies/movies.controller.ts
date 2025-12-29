import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { QueryParams } from './models/query.model';
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
  @Header('Cache-Control', 'public, max-age=3600')
  async getPurifiedMovieIds(
    @Query() query: QueryParams,
  ): Promise<PurifiedMovieIdsResDto> {
    return this.moviesService.getPurifiedMovieIds(query);
  }

  @Get('/info/:id')
  @Header('Cache-Control', 'public, max-age=3600')
  async getMovieInfo(@Param('id') id: number): Promise<MovieInfoResDto> {
    return this.moviesService.getMovieInfo(id);
  }

  @Get('/poster')
  @Header('Cache-Control', 'public, max-age=3600')
  getPostersInBulk(@Query() query: QueryParams): Promise<MoviePosterResDto> {
    return this.moviesService.getMoviesPoster(query);
  }
}
