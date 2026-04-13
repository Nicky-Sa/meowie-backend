import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { TmdbModule } from '../tmdb/tmdb.module';
import { ConstantsModule } from '../constants/constants.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TmdbModule, ConstantsModule, AiModule],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
