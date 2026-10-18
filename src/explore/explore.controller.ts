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
import { MediaType } from '@/types/media-type';

@Controller('explore')
export class ExploreController {
  constructor(
    private readonly exploreService: ExploreService,
    private readonly cls: ClsService,
  ) {}

  @Get(':mediaType/tabs')
  async getTabs(
    @Param('mediaType') mediaType: MediaType,
  ): Promise<ExploreTabResDto[]> {
    return this.exploreService.getActiveTabs(mediaType);
  }

  @Get(':mediaType/tabs/:slug')
  @UseInterceptors(TMDBErrorInterceptor)
  async getTabTitles(
    @Param('mediaType') mediaType: MediaType,
    @Param('slug') slug: string,
    @Query() query: ExploreTabPageQueryDto,
  ): Promise<PosterResDto> {
    return this.exploreService.getTabTitles(slug, mediaType, query.page, {
      today: DateTime.utc(),
      country: this.cls.countryCode,
      language: 'en-US',
    });
  }
}
