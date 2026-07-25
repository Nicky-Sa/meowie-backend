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
    const feed = await this.feedService.getFeed(
      req.user.id,
      'movie',
      query.page,
      query.refresh,
    );
    this.setCacheHeaders(res, req.user.id, query.refresh);
    return feed;
  }

  @OptionalAccessGuard()
  @Get('series')
  async getSeriesFeed(
    @Req() req: OptionallyAuthenticatedRequest,
    @Query() query: FeedQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<FeedResDto> {
    const feed = await this.feedService.getFeed(
      req.user.id,
      'series',
      query.page,
      query.refresh,
    );
    this.setCacheHeaders(res, req.user.id, query.refresh);
    return feed;
  }

  // Set only after a result: an error must not inherit the guest header and
  // get held by CloudFront for an hour.
  // Guest feeds are identical for everyone, so they're CDN-cacheable;
  // personalized responses must never be shared. CloudFront's cache key doesn't
  // include Authorization, so the client tags guest requests `audience=guest`.
  // A refresh is never cacheable — `refresh=true` is its own cache key, so the
  // CDN would hand every later pull the same "fresh" feed for an hour.
  private setCacheHeaders(
    res: Response,
    userId: number | null,
    refresh: boolean,
  ): void {
    if (userId === null && !refresh) {
      res.setHeader('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`);
    } else {
      res.setHeader('Cache-Control', 'private, no-store');
    }
  }
}
