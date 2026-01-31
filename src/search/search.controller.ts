import {
  Controller,
  Get,
  Header,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchReqQueryDto, MultiSearchResDto } from './dto/search.dto';

import { TMDBErrorInterceptor } from '../common/interceptors/tmdb-error.interceptor';

@Controller('search')
@UseInterceptors(TMDBErrorInterceptor)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('/multi')
  @Header('Cache-Control', 'public, max-age=3600')
  async multiSearch(
    @Query() { query }: SearchReqQueryDto,
  ): Promise<MultiSearchResDto> {
    return this.searchService.multiSearch(query);
  }
}
