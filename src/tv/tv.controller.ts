import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { TvService } from './tv.service';
import { TMDBErrorInterceptor } from '../common/interceptors/tmdb-error.interceptor';
import {
  InterestingTvIdsResDto,
  QueryParamsDto,
  TvInfoResDto,
} from './dto/tv.dto';
import { PosterResDto } from '../common/dto/poster.dto';

@Controller('tv')
@UseInterceptors(TMDBErrorInterceptor)
export class TvController {
  constructor(private readonly tvService: TvService) { }

  @Get('interesting-ids')
  async getInterestingTvIds(
    @Query() query: QueryParamsDto,
  ): Promise<InterestingTvIdsResDto> {
    return this.tvService.getInterestingTvIds(query);
  }

  @Get('/info/:id')
  @Header('Cache-Control', 'public, max-age=3600')
  async getTvInfo(@Param('id') id: number): Promise<TvInfoResDto> {
    return this.tvService.getTvInfo(id);
  }

  @Get('/posters')
  @Header('Cache-Control', 'public, max-age=3600')
  async getPostersInBulk(
    @Query() query: QueryParamsDto,
  ): Promise<PosterResDto> {
    const discoveredTvList = await this.tvService.getDiscoveredTv(query);
    return this.tvService.getTvPosters(discoveredTvList);
  }
}
