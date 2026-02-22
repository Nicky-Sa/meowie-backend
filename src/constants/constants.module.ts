import { Module } from '@nestjs/common';
import { ConstantsController } from './constants.controller';
import { ConstantsService } from './constants.service';
import { TmdbModule } from '../tmdb/tmdb.module';

@Module({
  imports: [TmdbModule],
  controllers: [ConstantsController],
  providers: [ConstantsService],
  exports: [ConstantsService],
})
export class ConstantsModule {}
