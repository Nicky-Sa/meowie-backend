import { z } from 'zod';

export const SEARCH_MEDIA_TYPE_VALUES = ['movie', 'series', 'person'] as const;

export const aiSearchAnswerSchema = z.object({
  matches: z.array(
    z.object({
      mediaType: z.enum(SEARCH_MEDIA_TYPE_VALUES),
      name: z.string(),
      year: z.number().nullable(),
    }),
  ),
});

export type AiSearchMatch = z.infer<
  typeof aiSearchAnswerSchema
>['matches'][number];
