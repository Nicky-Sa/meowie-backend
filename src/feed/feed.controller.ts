import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FeedService } from '@/feed/feed.service';
import { FeedQueryDto, FeedResDto } from '@/feed/dto/feed.dto';
import { OptionalAccessGuard } from '@/auth/guards/optional-access.guard';
import { OptionallyAuthenticatedRequest } from '@/auth/types/authenticated-request.type';
import { TMDBErrorInterceptor } from '@/common/interceptors/tmdb-error.interceptor';
import { Duration } from '@/common/app.constants';

@Controller('feed')
@UseInterceptors(TMDBErrorInterceptor)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @OptionalAccessGuard()
  @Get('movie')
  async getMovieFeed(
    @Req() req: OptionallyAuthenticatedRequest,
    @Query() query: FeedQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<FeedResDto> {
    this.setCacheHeaders(res, req.user.id);
    return this.feedService.getFeed(
      req.user.id,
      'movie',
      query.page,
      query.refresh,
    );
  }

  @OptionalAccessGuard()
  @Get('series')
  async getSeriesFeed(
    @Req() req: OptionallyAuthenticatedRequest,
    @Query() query: FeedQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<FeedResDto> {
    this.setCacheHeaders(res, req.user.id);
    return this.feedService.getFeed(
      req.user.id,
      'series',
      query.page,
      query.refresh,
    );
  }

  // Guest feed is identical for everyone, so it's CDN-cacheable; personalized
  // (logged-in) responses must never be shared. CloudFront's cache key doesn't
  // include Authorization, so the client keeps guest requests on a separate
  // cache key by tagging them `audience=guest` (the key includes query strings).
  private setCacheHeaders(res: Response, userId: number | null): void {
    if (userId === null) {
      res.setHeader('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`);
    } else {
      res.setHeader('Cache-Control', 'private, no-store');
    }
  }
}
