import { Injectable } from '@nestjs/common';
import { TasteService } from '@/taste/taste.service';
import { BaseContributor } from '@/feed/profile/contributors/base.contributor';
import { FeedProfileContribution } from '@/feed/profile/profile.types';

@Injectable()
export class TasteContributor extends BaseContributor {
  constructor(private readonly tasteService: TasteService) {
    super();
  }

  async contribute(userId: number): Promise<FeedProfileContribution> {
    const taste = await this.tasteService.getTasteForFeed(userId);

    return {
      genreIds: taste.genreIds.map((id) => ({ id, weight: 1 })),
      libraryMovieIds: [],
      librarySeriesIds: [],
    };
  }
}
