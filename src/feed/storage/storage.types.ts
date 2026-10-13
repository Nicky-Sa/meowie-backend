import { InputRequest } from '@/feed/engine/input/input.types';
import { ScoredTitle } from '@/feed/engine/scoring/scoring.types';
import { StoredSourceProgress } from '@/feed/engine/source/source.types';

export type FeedState = {
  sources: StoredSourceProgress;
  processedTitleIds: number[];
  /** Delivered titles stay here; delivery history determines which are unused. */
  waitingTitles: ScoredTitle[];
};

export type FeedStateRequest = InputRequest;

export type DeliveredTitleIds = number[];
