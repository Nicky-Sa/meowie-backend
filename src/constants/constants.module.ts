import { Module } from '@nestjs/common';
import { ConstantsController } from '@/constants/constants.controller';
import { ConstantsService } from '@/constants/constants.service';
import { TmdbModule } from '@/tmdb/tmdb.module';

@Module({
  imports: [TmdbModule],
  controllers: [ConstantsController],
  providers: [ConstantsService],
  exports: [ConstantsService],
})
export class ConstantsModule {}
