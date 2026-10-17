import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExploreTab } from '@/explore/entities/explore-tab.entity';
import { ExploreController } from '@/explore/explore.controller';
import { ExploreService } from '@/explore/explore.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExploreTab])],
  controllers: [ExploreController],
  providers: [ExploreService],
})
export class ExploreModule {}
