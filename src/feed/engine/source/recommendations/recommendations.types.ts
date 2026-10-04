import { z } from 'zod';
import { SourceRequest, SourceResult } from '@/feed/engine/source/source.types';

export type RecommendationsRequest = SourceRequest<
  readonly RecommendationsPageRequest[]
> & {
  titleIds: readonly number[];
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
