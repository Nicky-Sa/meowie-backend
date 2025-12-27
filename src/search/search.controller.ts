import { Controller, Get, Header, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchReqQueryDto, MultiSearchResDto } from './dto/search.dto';

@Controller('search')
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
