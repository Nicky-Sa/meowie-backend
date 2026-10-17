import { Controller, Get } from '@nestjs/common';
import { ExploreService } from '@/explore/explore.service';
import { ExploreTabResDto } from '@/explore/dto/explore-tab.dto';

@Controller('explore')
export class ExploreController {
  constructor(private readonly exploreService: ExploreService) {}

  @Get('tabs')
  async getTabs(): Promise<ExploreTabResDto[]> {
    return this.exploreService.getTabs();
  }
}
