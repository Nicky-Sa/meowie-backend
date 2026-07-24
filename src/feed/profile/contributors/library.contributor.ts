import { Injectable } from '@nestjs/common';
import { LibraryService } from '@/library/library.service';
import { LibraryItem } from '@/library/entities/library-item.entity';
import { BaseContributor } from '@/feed/profile/contributors/base.contributor';
import {
  FeedProfileContribution,
  WeightedId,
} from '@/feed/profile/profile.types';

// Assumes a 1–5 star rating scale. The weight ranks an item as a recommendation
// source: saved items are a mild signal, rated items scale from the midpoint
// (3★ = 0, 5★ = +1, 1★ = -1). The generator pulls recommendations from the
// strongest positive sources and ignores the rest.
const MAX_RATING = 5;
const RATING_MIDPOINT = 3;
const SAVED_WEIGHT = 0.5;
const SEEN_UNRATED_WEIGHT = 0.3;

@Injectable()
export class LibraryContributor extends BaseContributor {
  constructor(private readonly libraryService: LibraryService) {
    super();
  }

  async contribute(userId: number): Promise<FeedProfileContribution> {
    const items = await this.libraryService.getItemsForUser(userId);

    return {
      genreIds: [],
      knownMovieIds: this.toWeightedIds(items, 'movie'),
      knownSeriesIds: this.toWeightedIds(items, 'series'),
    };
  }

  private toWeightedIds(
    items: LibraryItem[],
    mediaType: LibraryItem['mediaType'],
  ): WeightedId[] {
    return items
      .filter((item) => item.mediaType === mediaType)
      .map((item) => ({ id: item.tmdbId, weight: this.itemWeight(item) }));
  }

  private itemWeight(item: LibraryItem): number {
    if (item.category === 'saved') {
      return SAVED_WEIGHT;
    }
    if (item.rating != null) {
      return (item.rating - RATING_MIDPOINT) / (MAX_RATING - RATING_MIDPOINT);
    }
    return SEEN_UNRATED_WEIGHT;
  }
}
