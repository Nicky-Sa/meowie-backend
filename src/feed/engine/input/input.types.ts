import { TasteInputResult } from '@/feed/engine/input/taste/taste.types';
import { LibraryInputResult } from '@/feed/engine/input/library/library.types';
import { MediaType } from '@/types/media-type';
import type { TasteInputService } from '@/feed/engine/input/taste/taste.service';
import type { LibraryInputService } from '@/feed/engine/input/library/library.service';

export type FeedInput = TasteInputService | LibraryInputService;

export type AccountInputRequest = {
  type: 'account';
  userId: number;
  mediaType: MediaType;
};

export type GuestInputRequest = {
  type: 'guest';
  deviceCode: string;
  mediaType: MediaType;
};

export type InputRequest = AccountInputRequest | GuestInputRequest;

export type InputResult = TasteInputResult | LibraryInputResult;
