import { Inject, Injectable } from '@nestjs/common';
import { BaseContributor } from '@/feed/profile/contributors/base.contributor';
import {
  FeedProfile,
  FeedProfileContribution,
  WeightedId,
} from '@/feed/profile/profile.types';

export const FEED_PROFILE_CONTRIBUTORS = 'FEED_PROFILE_CONTRIBUTORS';

@Injectable()
export class ProfileBuilder {
  constructor(
    @Inject(FEED_PROFILE_CONTRIBUTORS)
    private readonly contributors: BaseContributor[],
  ) {}

  async build(userId: number): Promise<FeedProfile> {
    const contributions = await Promise.all(
      this.contributors.map((contributor) => contributor.contribute(userId)),
    );

    return this.merge(contributions);
  }

  private merge(contributions: FeedProfileContribution[]): FeedProfile {
    return {
      genreIds: this.mergeWeightedIds(
        contributions.flatMap((contribution) => contribution.genreIds),
      ),
      libraryMovieIds: this.mergeWeightedIds(
        contributions.flatMap((contribution) => contribution.libraryMovieIds),
      ),
      librarySeriesIds: this.mergeWeightedIds(
        contributions.flatMap((contribution) => contribution.librarySeriesIds),
      ),
    };
  }

  private mergeWeightedIds(ids: WeightedId[]): WeightedId[] {
    const map = new Map<number, number>();
    for (const { id, weight } of ids) {
      map.set(id, (map.get(id) ?? 0) + weight);
    }
    return [...map.entries()].map(([id, weight]) => ({ id, weight }));
  }
}
