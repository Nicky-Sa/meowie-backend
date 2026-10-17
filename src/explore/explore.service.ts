import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExploreTab } from '@/explore/entities/explore-tab.entity';
import { ExploreTabResDto } from '@/explore/dto/explore-tab.dto';

@Injectable()
export class ExploreService {
  constructor(
    @InjectRepository(ExploreTab)
    private readonly exploreTabRepository: Repository<ExploreTab>,
  ) {}

  async getTabs(): Promise<ExploreTabResDto[]> {
    return this.exploreTabRepository.find({
      where: { isActive: true },
      order: { position: 'ASC', id: 'ASC' },
      select: { id: true, slug: true, title: true },
    });
  }
}
