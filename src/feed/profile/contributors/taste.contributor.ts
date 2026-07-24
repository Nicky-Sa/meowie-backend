import { Injectable } from '@nestjs/common';
import { TasteService } from '@/taste/taste.service';
import { BaseContributor } from '@/feed/profile/contributors/base.contributor';
import {
  FeedProfileContribution,
  WeightedId,
} from '@/feed/profile/profile.types';

// Below every positive library weight, so real saves and ratings always take
// the recommendation slots first.
const PICKED_TITLE_WEIGHT = 0.2;

@Injectable()
export class TasteContributor extends BaseContributor {
  constructor(private readonly tasteService: TasteService) {
    super();
  }

  async contribute(userId: number): Promise<FeedProfileContribution> {
    const taste = await this.tasteService.getTasteForFeed(userId);

    return {
      genreIds: taste.genreIds.map((id) => ({ id, weight: 1 })),
      knownMovieIds: this.toWeightedIds(taste.movieIds),
      knownSeriesIds: this.toWeightedIds(taste.seriesIds),
    };
  }

  private toWeightedIds(tmdbIds: number[]): WeightedId[] {
    return tmdbIds.map((id) => ({ id, weight: PICKED_TITLE_WEIGHT }));
  }
}
