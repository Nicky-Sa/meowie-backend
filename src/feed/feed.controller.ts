import { Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import { FeedService } from '@/feed/feed.service';
import { FeedResDto } from '@/feed/dto/feed.dto';
import { OptionalAccessGuard } from '@/auth/guards/optional-access.guard';
import { OptionallyAuthenticatedRequest } from '@/auth/types/authenticated-request.type';
import { TMDBErrorInterceptor } from '@/common/interceptors/tmdb-error.interceptor';

@Controller('feed')
@UseInterceptors(TMDBErrorInterceptor)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @OptionalAccessGuard()
  @Get('movie')
  async getMovieFeed(
    @Req() req: OptionallyAuthenticatedRequest,
  ): Promise<FeedResDto> {
    return this.feedService.getFeed(req.user.id, 'movie');
  }

  @OptionalAccessGuard()
  @Get('series')
  async getSeriesFeed(
    @Req() req: OptionallyAuthenticatedRequest,
  ): Promise<FeedResDto> {
    return this.feedService.getFeed(req.user.id, 'series');
  }
}
