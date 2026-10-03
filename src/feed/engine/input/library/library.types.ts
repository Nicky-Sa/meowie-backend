import { Candidate } from '@/feed/engine/candidate.types';
import { LibraryItem } from '@/library/entities/library-item.entity';

export type LibraryTitle = Candidate & Pick<LibraryItem, 'rating'>;

export type LibraryInputResult = {
  type: 'library';
  titles: {
    saved: Candidate[];
    seen: LibraryTitle[];
  };
};
