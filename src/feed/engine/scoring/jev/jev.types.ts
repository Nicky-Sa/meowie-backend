import { z } from 'zod';
import {
  ScoringRequest,
  ScoringResult,
} from '@/feed/engine/scoring/scoring.types';
import { FIT_LEVELS } from '@/feed/engine/scoring/scoring.utils';

export type JevRequest = ScoringRequest;

export type JevResult = ScoringResult;

export type JevBody = {
  model: string;
  state: string;
  questions: Record<
    string,
    {
      type: 'score';
      instructions: string;
      criteria: readonly string[];
    }
  >;
};

export const jevAnswerSchema = z.object({
  answers: z.record(
    z.string(),
    z.object({
      type: z.literal('score'),
      score: z
        .number()
        .min(0)
        .max(FIT_LEVELS.length - 1),
    }),
  ),
});
