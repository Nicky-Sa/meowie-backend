import { Injectable } from '@nestjs/common';
import { buildAvoidRules } from '@/feed/constants/avoid.constant';
import { FilterService } from '@/feed/engine/filter/filter.service';
import {
  AvoidRequest,
  AvoidResult,
} from '@/feed/engine/filter/avoid/avoid.types';
import { TasteService } from '@/taste/taste.service';

@Injectable()
export class AvoidFilterService extends FilterService {
  readonly name = 'avoid';

  constructor(private readonly tasteService: TasteService) {
    super();
  }

  async filter({ userId, candidates }: AvoidRequest): Promise<AvoidResult> {
    const { avoid } = await this.tasteService.getTasteForFeed(userId);
    const { blockedGenreIds, blockedKeywordIds } = buildAvoidRules(avoid);

    return candidates.filter(
      ({ genres, keywords }) =>
        !genres.some(({ id }) => blockedGenreIds.has(id)) &&
        !keywords.some(({ id }) => blockedKeywordIds.has(id)),
    );
  }
}
