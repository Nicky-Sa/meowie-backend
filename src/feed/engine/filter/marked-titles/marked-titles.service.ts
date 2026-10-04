import { Injectable } from '@nestjs/common';
import { FilterService } from '@/feed/engine/filter/filter.service';
import {
  MarkedTitlesRequest,
  MarkedTitlesResult,
} from '@/feed/engine/filter/marked-titles/marked-titles.types';
import { LibraryItem } from '@/library/entities/library-item.entity';
import { LibraryService } from '@/library/library.service';
import { TasteService } from '@/taste/taste.service';
import { TasteForFeed } from '@/taste/types/taste.type';

@Injectable()
export class MarkedTitlesFilterService extends FilterService {
  readonly name = 'marked-titles';

  constructor(
    private readonly tasteService: TasteService,
    private readonly libraryService: LibraryService,
  ) {
    super();
  }

  async filter({
    userId,
    candidates,
  }: MarkedTitlesRequest): Promise<MarkedTitlesResult> {
    const [taste, items] = await Promise.all([
      this.tasteService.getTasteForFeed(userId),
      this.libraryService.getItemsForUser(userId),
    ]);
    const markedTitles = this.getMarkedTitles(taste, items);

    return candidates.filter(
      ({ id, mediaType }) => !markedTitles.has(`${mediaType}:${id}`),
    );
  }

  private getMarkedTitles(
    taste: TasteForFeed,
    libraryItems: readonly LibraryItem[],
  ): Set<string> {
    const markedTitles = new Set(
      libraryItems.map(({ mediaType, tmdbId }) => `${mediaType}:${tmdbId}`),
    );

    for (const [mediaType, ratings] of [
      ['movie', taste.movieRatings],
      ['series', taste.seriesRatings],
    ] as const) {
      for (const [id, answer] of Object.entries(ratings)) {
        if (answer === 'like' || answer === 'dislike') {
          markedTitles.add(`${mediaType}:${Number(id)}`);
        }
      }
    }

    return markedTitles;
  }
}
