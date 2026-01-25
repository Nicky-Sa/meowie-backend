import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { SeriesService } from './series.service';
import { TMDBErrorInterceptor } from '../utils/tmdb-error.interceptor';
import {
  InterestingSeriesIdsResDto,
  QueryParamsDto,
  SeriesInfoResDto,
} from './dto/series.dto';

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
  @Header('Cache-Control', 'public, max-age=3600')
  async getSeriesInfo(@Param('id') id: number): Promise<SeriesInfoResDto> {
    return this.seriesService.getSeriesInfo(id);
  }
}
