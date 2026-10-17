import { Module } from '@nestjs/common';
import { SearchService } from '@/search/search.service';
import { SearchController } from '@/search/search.controller';
import { TmdbModule } from '@/tmdb/tmdb.module';
import { ConstantsModule } from '@/constants/constants.module';

@Module({
  imports: [TmdbModule, ConstantsModule],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
