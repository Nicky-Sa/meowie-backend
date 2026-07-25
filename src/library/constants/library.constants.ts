export const LIBRARY_CATEGORIES = ['saved', 'seen'] as const;
export type LibraryCategory = (typeof LIBRARY_CATEGORIES)[number];

export const LOWEST_RATING = 1;
export const HIGHEST_RATING = 10;
