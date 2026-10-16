import { z } from 'zod';
import { SourceRequest, SourceResult } from '@/feed/engine/source/source.types';

export type RecommendationInput = {
  titleIds: readonly number[];
  weight: number;
};

export type RecommendationsRequest = SourceRequest<
  readonly RecommendationsPageRequest[]
> & {
  inputs: readonly RecommendationInput[];
};

export type RecommendationsResult = SourceResult<
  readonly RecommendationsPageRequest[]
>;

export const recommendationsPageSchema = z.object({
  id: z.number().int().positive(),
  page: z.number().int().positive(),
});

export type RecommendationsPageRequest = z.infer<
  typeof recommendationsPageSchema
>;
