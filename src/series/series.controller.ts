import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { SeriesService } from './series.service';
import { TMDBErrorInterceptor } from '../utils/tmdb-error.interceptor';
import { InterestingSeriesIdsResDto, QueryParamsDto } from './dto/series.dto';

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
}
