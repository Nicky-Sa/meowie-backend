import { Injectable } from '@nestjs/common';
import { InputService } from '@/feed/engine/input/input.service';
import { InputRequest } from '@/feed/engine/input/input.types';
import { LibraryInputResult } from '@/feed/engine/input/library/library.types';
import { LibraryService } from '@/library/library.service';

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

    return {
      type: 'library',
      titles: {
        saved: items
          .filter((item) => item.category === 'saved')
          .map(({ tmdbId }) => ({ id: tmdbId, mediaType })),
        seen: items
          .filter((item) => item.category === 'seen')
          .map(({ tmdbId, rating }) => ({ id: tmdbId, mediaType, rating })),
      },
    };
  }
}
