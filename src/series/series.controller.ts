import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { SeriesService } from '@/series/series.service';
import { TMDBErrorInterceptor } from '@/common/interceptors/tmdb-error.interceptor';
import {
  InterestingSeriesIdsResDto,
  QueryParamsDto,
  SeriesInfoResDto,
} from '@/series/dto/series.dto';
import { PosterResDto } from '@/common/dto/poster.dto';
import { Duration } from '@/common/app.constants';
import { ClsService } from '@/common/cls/cls.service';

@Controller('series')
@UseInterceptors(TMDBErrorInterceptor)
export class SeriesController {
  constructor(
    private readonly seriesService: SeriesService,
    private readonly cls: ClsService,
  ) {}

  @Get('interesting')
  @Header('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`)
  async getInterestingSeriesIds(
    @Query() query: QueryParamsDto,
  ): Promise<InterestingSeriesIdsResDto> {
    return this.seriesService.getInterestingSeriesIds(query);
  }

  @Get(':id')
  @Header('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`)
  async getSeriesInfo(@Param('id') id: number): Promise<SeriesInfoResDto> {
    return this.seriesService.getSeriesInfo(id, this.cls.countryCode);
  }

  @Get(':id/recommendations/posters')
  @Header('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`)
  async getSeriesRecommendations(
    @Param('id') id: number,
    @Query('page') page: number,
  ): Promise<PosterResDto> {
    return this.seriesService.getSeriesRecommendations(id, page);
  }

  @Get('posters')
  @Header('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`)
  async getSeriesPostersInBulk(
    @Query() query: QueryParamsDto,
  ): Promise<PosterResDto> {
    return this.seriesService.getSeriesPosters(query);
  }
}
