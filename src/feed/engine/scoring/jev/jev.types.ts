import { z } from 'zod';
import { Title } from '@/feed/engine/engine.types';
import {
  ScoringRequest,
  ScoringResult,
} from '@/feed/engine/scoring/scoring.types';
import { MAX_FIT_SCORE } from '@/feed/engine/scoring/scoring.constants';

export type JevRequest = ScoringRequest;

export type JevResult = ScoringResult;

export type JevTitleDetails = {
  title: string;
  year: number | null;
  overview: string;
  genres: string[];
  keywords: string[];
};

export type JevKnownTitle = Title & {
  details: JevTitleDetails | null;
  context: string[];
};

export type JevState = {
  rules: readonly string[];
  known: JevKnownTitle[];
};

export type JevBody = {
  model: string;
  state: JevState;
  questions: Record<
    string,
    {
      type: 'score';
      instructions: {
        question: string;
        candidate: JevTitleDetails;
      };
      criteria: readonly string[];
    }
  >;
};

export const jevAnswerSchema = z.object({
  answers: z.record(
    z.string(),
    z.object({
      type: z.literal('score'),
      score: z.number().min(0).max(MAX_FIT_SCORE),
    }),
  ),
});
