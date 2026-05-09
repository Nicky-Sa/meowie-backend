import {
  Controller,
  Get,
  Header,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { SearchService } from '@/search/search.service';
import { SearchReqQueryDto, MultiSearchResDto } from '@/search/dto/search.dto';

import { TMDBErrorInterceptor } from '@/common/interceptors/tmdb-error.interceptor';
import { Duration } from '@/common/app.constants';

@Controller('search')
@UseInterceptors(TMDBErrorInterceptor)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('/multi')
  @Header('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`)
  @Throttle({ short: { limit: 10, ttl: Duration.ONE_MINUTE * 1000 } })
  async multiSearch(
    @Query() { query }: SearchReqQueryDto,
  ): Promise<MultiSearchResDto> {
    return this.searchService.multiSearch(query);
  }
}
