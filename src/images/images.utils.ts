import {
  PERSON_FALLBACK_URL,
  MOVIE_POSTER_FALLBACK_URL,
  TV_POSTER_FALLBACK_URL,
  TMDB_IMAGE_BASE_URL,
  TMDB_IMAGE_SIZES,
} from '@/common/app.constants';

export type ImageSize = keyof typeof TMDB_IMAGE_SIZES;

export const getImageWithFallback = (
  path: string | null | undefined,
  type: 'movie_poster' | 'series_poster' | 'person' | 'watch_provider',
  size: ImageSize = 'small',
) => {
  if (!path) {
    switch (type) {
      case 'movie_poster':
        return MOVIE_POSTER_FALLBACK_URL;
      case 'series_poster':
        return TV_POSTER_FALLBACK_URL;
      case 'person':
        return PERSON_FALLBACK_URL;
      case 'watch_provider': // to be determined
        return TV_POSTER_FALLBACK_URL;
    }
  }
  return getImageFullUrl(path, size) as string; // path is already a string if we got this far
};

export const getImageFullUrl = (
  path: string | null | undefined,
  size: ImageSize = 'small',
) => {
  if (!path) {
    return;
  }
  return `${TMDB_IMAGE_BASE_URL}/${TMDB_IMAGE_SIZES[size]}${path}`;
};
