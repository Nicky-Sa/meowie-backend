import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExploreTab } from '@/explore/entities/explore-tab.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExploreTab])],
})
export class ExploreModule {}
