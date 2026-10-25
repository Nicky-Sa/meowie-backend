import { InputRequest } from '@/feed/engine/input/input.types';
import {
  Candidate,
  StoredSourceProgress,
} from '@/feed/engine/source/source.types';

export type FeedState = {
  inputId: string;
  sources: StoredSourceProgress;
};

export type ProcessedTitleToSave = Candidate & {
  isAccepted: boolean;
  timesScored: number;
  lastScore: number | null;
};

export type FeedStateToSave = FeedState & {
  processedTitles: ProcessedTitleToSave[];
};

export type TitleToRetry = Candidate & {
  timesScored: number;
};

export type FeedDelivery = {
  titleIds: number[];
  status: 'ready' | 'preparing';
  sourcesExhausted: boolean;
};

export type FeedStateRequest = InputRequest;
