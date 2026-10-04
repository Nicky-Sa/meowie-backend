import { z } from 'zod';
import { SourceRequest, SourceResult } from '@/feed/engine/source/source.types';

export type DiscoverRequest = SourceRequest<readonly DiscoverPageRequest[]>;

export type DiscoverResult = SourceResult<readonly DiscoverPageRequest[]>;

export const discoverPageSchema = z.object({
  page: z.number().int().positive(),
});

export type DiscoverPageRequest = z.infer<typeof discoverPageSchema>;
