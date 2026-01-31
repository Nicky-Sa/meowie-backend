export const LIBRARY_MEDIA_TYPES = ['movie', 'tv'] as const;
export type LibraryMediaType = (typeof LIBRARY_MEDIA_TYPES)[number];

export const LIBRARY_CATEGORIES = ['saved', 'seen'] as const;
export type LibraryCategory = (typeof LIBRARY_CATEGORIES)[number];
