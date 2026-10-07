import { Title } from '@/feed/engine/engine.types';
import { LibraryItem } from '@/library/entities/library-item.entity';

export type LibraryTitle = Title & Pick<LibraryItem, 'rating'>;

export type LibraryInputResult = {
  type: 'library';
  titles: {
    saved: Title[];
    seen: LibraryTitle[];
  };
};
