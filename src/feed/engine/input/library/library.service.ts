import { Injectable } from '@nestjs/common';
import { SAVED_TITLE_WEIGHT } from '@/feed/constants/feed.constant';
import { InputService } from '@/feed/engine/input/input.service';
import { InputRequest } from '@/feed/engine/input/input.types';
import { LibraryInputResult } from '@/feed/engine/input/library/library.types';
import { LibraryService } from '@/library/library.service';
import { MediaType } from '@/types/media-type';

@Injectable()
export class LibraryInputService extends InputService<LibraryInputResult> {
  readonly name = 'library';

  constructor(private readonly libraryService: LibraryService) {
    super();
  }

  async read(request: InputRequest): Promise<LibraryInputResult> {
    const { mediaType } = request;
    const items =
      request.type === 'guest'
        ? []
        : await this.libraryService.getItemsForUser(request.userId, mediaType);

    const titles = {
      saved: items
        .filter((item) => item.category === 'saved')
        .map(({ tmdbId }) => ({ id: tmdbId, mediaType })),
      seen: items
        .filter((item) => item.category === 'seen')
        .map(({ tmdbId, rating }) => ({ id: tmdbId, mediaType, rating })),
    };

    return {
      type: 'library',
      titles,
      weight: this.getWeight(titles, mediaType),
    };
  }

  /** Returns the library's recommendation weight: each rated title adds 1 and each saved title adds 0.25.
   * Counts each title once for the chosen media type. Seen titles without a rating add nothing. */
  private getWeight(
    titles: LibraryInputResult['titles'],
    mediaType: MediaType,
  ): number {
    const ratedIds = new Set(
      titles.seen
        .filter(
          (title) => title.mediaType === mediaType && title.rating !== null,
        )
        .map((title) => title.id),
    );
    const savedIds = new Set(
      titles.saved
        .filter(
          (title) => title.mediaType === mediaType && !ratedIds.has(title.id),
        )
        .map((title) => title.id),
    );
    return ratedIds.size + savedIds.size * SAVED_TITLE_WEIGHT;
  }
}
