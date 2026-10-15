import { InputRequest } from '@/feed/engine/input/input.types';
import { ScoredTitle } from '@/feed/engine/scoring/scoring.types';
import { StoredSourceProgress } from '@/feed/engine/source/source.types';

export type FeedState = {
  inputId: string;
  sources: StoredSourceProgress;
  processedTitleIds: number[];
  allScoredTitles: ScoredTitle[];
};

export type FeedStateRequest = InputRequest;

export type DeliveredTitleIds = number[];
