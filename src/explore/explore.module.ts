import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExploreTab } from '@/explore/entities/explore-tab.entity';
import { ExploreController } from '@/explore/explore.controller';
import { ExploreService } from '@/explore/explore.service';
import { ExploreSourceService } from '@/explore/sources/source.service';
import { ImagesModule } from '@/images/images.module';
import { TmdbModule } from '@/tmdb/tmdb.module';

@Module({
  imports: [TypeOrmModule.forFeature([ExploreTab]), ImagesModule, TmdbModule],
  controllers: [ExploreController],
  providers: [ExploreService, ExploreSourceService],
})
export class ExploreModule {}
