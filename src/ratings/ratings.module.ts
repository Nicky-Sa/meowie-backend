import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { EnvModule } from 'src/env/env.module';

@Module({
  imports: [EnvModule],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
