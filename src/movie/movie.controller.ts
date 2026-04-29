import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import {
  InterestingMovieIdsResDto,
  MovieInfoResDto,
  QueryParamsDto,
} from './dto/movie.dto';
import { TMDBErrorInterceptor } from '../common/interceptors/tmdb-error.interceptor';
import { PosterResDto } from '../common/dto/poster.dto';
import { Duration } from '../common/app.constants';

@Controller('movie')
@UseInterceptors(TMDBErrorInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get('interesting-ids')
  @Header('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`)
  async getInterestingMovieIds(
    @Query() query: QueryParamsDto,
  ): Promise<InterestingMovieIdsResDto> {
    return this.movieService.getInterestingMovieIds(query);
  }

  @Get('/info/:id')
  @Header('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`)
  async getMovieInfo(@Param('id') id: number): Promise<MovieInfoResDto> {
    return this.movieService.getMovieInfo(id);
  }

  @Get('/posters')
  @Header('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`)
  async getMoviePostersInBulk(
    @Query() query: QueryParamsDto,
  ): Promise<PosterResDto> {
    return this.movieService.getMoviesPosters(query);
  }
}
