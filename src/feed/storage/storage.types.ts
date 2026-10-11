import { InputRequest } from '@/feed/engine/input/input.types';
import { ScoredTitle } from '@/feed/engine/scoring/scoring.types';
import { StoredSourceProgress } from '@/feed/engine/source/source.types';

export type FeedState = {
  sources: StoredSourceProgress;
  processedTitleIds: number[];
  waitingTitles: ScoredTitle[];
  deliveredPages: Record<number, number[]>;
};

export type FeedStorageRequest = InputRequest;

export type FeedStorageResult = FeedState;
