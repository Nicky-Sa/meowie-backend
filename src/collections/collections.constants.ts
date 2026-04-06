export const CATEGORY_SOURCE_TYPE_VALUES = [
  'tmdb_endpoint',
  'manual',
  'group',
] as const;
export type CollectionSourceType = (typeof CATEGORY_SOURCE_TYPE_VALUES)[number];

export const CATEGORY_MEDIA_TYPE_VALUES = ['movie', 'series', 'mixed'] as const;
export type CollectionMediaType = (typeof CATEGORY_MEDIA_TYPE_VALUES)[number];
