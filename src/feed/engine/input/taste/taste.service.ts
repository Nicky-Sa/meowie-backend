import { Injectable } from '@nestjs/common';
import { InputService } from '@/feed/engine/input/input.service';
import { InputRequest } from '@/feed/engine/input/input.types';
import { TasteInputResult } from '@/feed/engine/input/taste/taste.types';
import { TasteService } from '@/taste/taste.service';
import { titleIdsMarkedAs } from '@/taste/utils/taste.utils';

@Injectable()
export class TasteInputService extends InputService<TasteInputResult> {
  readonly name = 'taste';

  constructor(private readonly tasteService: TasteService) {
    super();
  }

  async read({ userId, mediaType }: InputRequest): Promise<TasteInputResult> {
    const taste = await this.tasteService.getAccountTasteForFeed(userId);
    const ratings =
      mediaType === 'movie' ? taste.movieRatings : taste.seriesRatings;

    return {
      type: 'taste',
      titles: {
        liked: titleIdsMarkedAs(ratings, 'like').map((id) => ({
          id,
          mediaType,
        })),
        disliked: titleIdsMarkedAs(ratings, 'dislike').map((id) => ({
          id,
          mediaType,
        })),
      },
    };
  }
}
