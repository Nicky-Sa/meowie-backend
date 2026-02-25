export const LIBRARY_CATEGORIES = ['saved', 'seen'] as const;
export type LibraryCategory = (typeof LIBRARY_CATEGORIES)[number];
