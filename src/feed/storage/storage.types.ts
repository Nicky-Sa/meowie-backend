import { InputRequest } from '@/feed/engine/input/input.types';
import { StoredSourceProgress } from '@/feed/engine/source/source.types';

export type FeedState = {
  inputId: string;
  sources: StoredSourceProgress;
  processedTitleIds: number[];
  scoredTitleIds: number[];
};

export type FeedStateRequest = InputRequest;

export type DeliveredTitleIds = number[];
