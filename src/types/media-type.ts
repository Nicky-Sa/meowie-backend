export const MEDIA_TYPE_VALUES = ['movie', 'tv'] as const;
export type MediaType = (typeof MEDIA_TYPE_VALUES)[number];
