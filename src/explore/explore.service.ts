import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExploreTab } from '@/explore/entities/explore-tab.entity';
import { ExploreTabResDto } from '@/explore/dto/explore-tab.dto';
import { ExploreTabPage } from '@/explore/explore.types';
import { ExploreSourceService } from '@/explore/sources/source.service';
import { SourcePlaceholderValues } from '@/explore/sources/source.utils';

@Injectable()
export class ExploreService {
  constructor(
    @InjectRepository(ExploreTab)
    private readonly exploreTabRepository: Repository<ExploreTab>,
    private readonly exploreSourceService: ExploreSourceService,
  ) {}

  async getTabs(): Promise<ExploreTabResDto[]> {
    return this.exploreTabRepository.find({
      where: { isActive: true },
      order: { position: 'ASC', id: 'ASC' },
      select: { id: true, slug: true, title: true },
    });
  }

  async chooseTabPage(
    slug: string,
    page: number | undefined,
    sourcePlaceholderValues: SourcePlaceholderValues,
  ): Promise<ExploreTabPage> {
    if (page !== undefined && (!Number.isInteger(page) || page < 1)) {
      throw new BadRequestException('Page must be a positive integer');
    }

    const tab = await this.exploreTabRepository.findOneBy({
      slug,
      isActive: true,
    });

    if (!tab) {
      throw new NotFoundException(`Active tab "${slug}" not found`);
    }

    if (tab.sources.length === 0) {
      throw new BadRequestException(`Tab "${slug}" has no sources`);
    }

    // if page is supplied, respect it and return the tab with the page
    if (page !== undefined) {
      return { tab, page };
    }

    // if page is not supplied, pick a random one from cached pages of the source with least number of pages
    let cachedPages: number[] = [];

    for (const source of tab.sources) {
      let sourcePages =
        await this.exploreSourceService.getAlreadyCachedSourcePages(
          source,
          sourcePlaceholderValues,
        );

      if (sourcePages.length === 0) {
        await this.exploreSourceService.prepareSourcePages(
          source,
          sourcePlaceholderValues,
        );
        sourcePages =
          await this.exploreSourceService.getAlreadyCachedSourcePages(
            source,
            sourcePlaceholderValues,
          );
      }

      if (
        cachedPages.length === 0 ||
        sourcePages.length < cachedPages.length // picking the source with the least amount of pages
      ) {
        cachedPages = sourcePages;
      }
    }

    return {
      tab,
      page: this.choosePage(cachedPages, Math.random()),
    };
  }

  private choosePage(pages: number[], randomValue: number): number {
    return pages[Math.floor(randomValue * pages.length)];
  }
}
