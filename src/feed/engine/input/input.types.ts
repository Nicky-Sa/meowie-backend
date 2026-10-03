import { TasteInputResult } from '@/feed/engine/input/taste/taste.types';
import { LibraryInputResult } from '@/feed/engine/input/library/library.types';
import { MediaType } from '@/types/media-type';

export type InputRequest = {
  userId: number;
  mediaType: MediaType;
};

export type InputResult = TasteInputResult | LibraryInputResult;
