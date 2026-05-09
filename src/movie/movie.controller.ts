import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { MovieService } from '@/movie/movie.service';
import {
  InterestingMovieIdsResDto,
  MovieInfoResDto,
  QueryParamsDto,
} from '@/movie/dto/movie.dto';
import { TMDBErrorInterceptor } from '@/common/interceptors/tmdb-error.interceptor';
import { PosterResDto } from '@/common/dto/poster.dto';
import { ClsService } from '@/common/cls/cls.service';
import { Duration } from '@/common/app.constants';

@Controller('movie')
@UseInterceptors(TMDBErrorInterceptor)
export class MovieController {
  constructor(
    private readonly movieService: MovieService,
    private readonly cls: ClsService,
  ) {}

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
    return this.movieService.getMovieInfo(id, this.cls.countryCode);
  }

  @Get('/details/:id/recommendations/posters')
  @Header('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`)
  async getMovieRecommendations(
    @Param('id') id: number,
    @Query('page') page: number,
  ): Promise<PosterResDto> {
    return this.movieService.getMovieRecommendations(id, page);
  }

  @Get('/posters')
  @Header('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`)
  async getMoviePostersInBulk(
    @Query() query: QueryParamsDto,
  ): Promise<PosterResDto> {
    return this.movieService.getMoviesPosters(query);
  }
}
