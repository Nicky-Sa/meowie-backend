import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import _shuffle from 'lodash/shuffle';
import _uniqBy from 'lodash/uniqBy';
import { TMDB_MAX_PAGE } from '@/common/app.constants';
import { PosterResDto } from '@/common/dto/poster.dto';
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

  async getTabTitles(
    slug: string,
    requestedPage: number | undefined,
    sourcePlaceholderValues: SourcePlaceholderValues,
  ): Promise<PosterResDto> {
    const { tab, page } = await this.chooseTabPage(
      slug,
      requestedPage,
      sourcePlaceholderValues,
    );
    const sourcesData: PosterResDto[] = [];

    // process 2 sources at a time and fetch data on chooseTabPage's "page"
    for (let i = 0; i < tab.sources.length; i += 2) {
      const pages = await Promise.all(
        tab.sources
          .slice(i, i + 2)
          .map((source) =>
            this.exploreSourceService.getSourcePage(
              source,
              page,
              sourcePlaceholderValues,
            ),
          ),
      );
      sourcesData.push(...pages);
    }

    const results = _uniqBy(
      sourcesData.flatMap((sourcePage) => sourcePage.results),
      (title) => `${title.mediaType}-${title.id}`,
    );
    return {
      results: _shuffle(results),
      page,
      total_pages: Math.min(
        TMDB_MAX_PAGE,
        Math.max(...sourcesData.map((sourcePage) => sourcePage.total_pages)),
      ),
      total_results: sourcesData.reduce(
        (total, sourcePage) => total + sourcePage.total_results,
        0,
      ),
    };
  }

  private choosePage(pages: number[], randomValue: number): number {
    return pages[Math.floor(randomValue * pages.length)];
  }
}
