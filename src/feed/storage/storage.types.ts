import { InputRequest } from '@/feed/engine/input/input.types';
import {
  Candidate,
  StoredSourceProgress,
} from '@/feed/engine/source/source.types';

export type FeedState = {
  inputId: string;
  sources: StoredSourceProgress;
};

export type FeedStateToSave = FeedState & {
  newProcessedTitles: Candidate[];
  newAcceptedTitleIds: number[];
};

export type FeedDelivery = {
  titleIds: number[];
  status: 'ready' | 'preparing';
  sourcesExhausted: boolean;
};

export type FeedStateRequest = InputRequest;
