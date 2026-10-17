import { InputRequest } from '@/feed/engine/input/input.types';
import { StoredSourceProgress } from '@/feed/engine/source/source.types';

export type FeedState = {
  inputId: string;
  sources: StoredSourceProgress;
};

export type FeedStateToSave = FeedState & {
  newProcessedTitleIds: number[];
  newAcceptedTitleIds: number[];
};

export type FeedDelivery = {
  titleIds: number[];
  status: 'ready' | 'preparing';
  sourcesExhausted: boolean;
};

export type FeedStateRequest = InputRequest;
