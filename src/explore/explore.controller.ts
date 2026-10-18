import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { DateTime } from 'luxon';
import { ClsService } from '@/common/cls/cls.service';
import { PosterResDto } from '@/common/dto/poster.dto';
import { TMDBErrorInterceptor } from '@/common/interceptors/tmdb-error.interceptor';
import { ExploreService } from '@/explore/explore.service';
import {
  ExploreTabPageQueryDto,
  ExploreTabResDto,
} from '@/explore/dto/explore-tab.dto';

@Controller('explore')
export class ExploreController {
  constructor(
    private readonly exploreService: ExploreService,
    private readonly cls: ClsService,
  ) {}

  @Get('tabs')
  async getTabs(): Promise<ExploreTabResDto[]> {
    return this.exploreService.getTabs();
  }

  @Get('tabs/:slug')
  @UseInterceptors(TMDBErrorInterceptor)
  async getTabTitles(
    @Param('slug') slug: string,
    @Query() query: ExploreTabPageQueryDto,
  ): Promise<PosterResDto> {
    return this.exploreService.getTabTitles(slug, query.page, {
      today: DateTime.utc(),
      country: this.cls.countryCode,
      language: 'en-US',
    });
  }
}
