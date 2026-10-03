import { Candidate } from '@/feed/engine/candidate.types';
import { LibraryItem } from '@/library/entities/library-item.entity';
import { MediaType } from '@/types/media-type';

export type InputRequest = {
  userId: number;
  mediaType: MediaType;
};

export type LibraryTitle = Candidate & Pick<LibraryItem, 'rating'>;

export type TasteInputResult = {
  type: 'taste';
  titles: {
    liked: Candidate[];
    disliked: Candidate[];
  };
};

export type LibraryInputResult = {
  type: 'library';
  titles: {
    saved: Candidate[];
    seen: LibraryTitle[];
  };
};

export type InputResult = TasteInputResult | LibraryInputResult;
