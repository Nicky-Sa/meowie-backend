import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import {
  InterestingMovieIdsResDto,
  MovieInfoResDto,
  MoviePosterResDto,
  QueryParamsDto,
} from './dto/movies.dto';
import { TMDBErrorInterceptor } from '../utils/tmdb-error.interceptor';

@Controller('movies')
@UseInterceptors(TMDBErrorInterceptor)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('interesting-ids')
  @Header('Cache-Control', 'public, max-age=3600')
  async getInterestingMovieIds(
    @Query() query: QueryParamsDto,
  ): Promise<InterestingMovieIdsResDto> {
    return this.moviesService.getInterestingMovieIds(query);
  }

  @Get('/info/:id')
  @Header('Cache-Control', 'public, max-age=3600')
  async getMovieInfo(@Param('id') id: number): Promise<MovieInfoResDto> {
    return this.moviesService.getMovieInfo(id);
  }

  @Get('/poster')
  @Header('Cache-Control', 'public, max-age=3600')
  async getPostersInBulk(
    @Query() query: QueryParamsDto,
  ): Promise<MoviePosterResDto> {
    const discoveredMoviesList =
      await this.moviesService.getDiscoveredMovies(query);
    return this.moviesService.getMoviesPoster(discoveredMoviesList);
  }
}
