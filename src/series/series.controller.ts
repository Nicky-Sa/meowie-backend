import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { SeriesService } from './series.service';
import { TMDBErrorInterceptor } from '../common/interceptors/tmdb-error.interceptor';
import {
  InterestingSeriesIdsResDto,
  QueryParamsDto,
  SeriesInfoResDto,
} from './dto/series.dto';
import { PosterResDto } from '../common/dto/poster.dto';
import { Duration } from '../common/app.constants';

@Controller('series')
@UseInterceptors(TMDBErrorInterceptor)
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Get('interesting-ids')
  async getInterestingSeriesIds(
    @Query() query: QueryParamsDto,
  ): Promise<InterestingSeriesIdsResDto> {
    return this.seriesService.getInterestingSeriesIds(query);
  }

  @Get('/info/:id')
  @Header('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`)
  async getSeriesInfo(@Param('id') id: number): Promise<SeriesInfoResDto> {
    return this.seriesService.getSeriesInfo(id);
  }

  @Get('/posters')
  @Header('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`)
  async getSeriesPostersInBulk(
    @Query() query: QueryParamsDto,
  ): Promise<PosterResDto> {
    return this.seriesService.getSeriesPosters(query);
  }
}
