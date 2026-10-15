import { Injectable } from '@nestjs/common';
import { InputService } from '@/feed/engine/input/input.service';
import { InputRequest } from '@/feed/engine/input/input.types';
import { TasteInputResult } from '@/feed/engine/input/taste/taste.types';
import { TasteService } from '@/taste/taste.service';
import { titleIdsMarkedAs } from '@/taste/utils/taste.utils';
import { TasteForFeed } from '@/taste/types/taste.type';
import { MediaType } from '@/types/media-type';

@Injectable()
export class TasteInputService extends InputService<TasteInputResult> {
  readonly name = 'taste';

  constructor(private readonly tasteService: TasteService) {
    super();
  }

  async read(request: InputRequest): Promise<TasteInputResult> {
    const taste =
      request.type === 'guest'
        ? await this.tasteService.getGuestTasteForFeed(request.deviceCode)
        : await this.tasteService.getAccountTasteForFeed(request.userId);

    return this.toTasteInput(taste, request.mediaType);
  }

  private toTasteInput(
    taste: TasteForFeed,
    mediaType: MediaType,
  ): TasteInputResult {
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
