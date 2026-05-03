import {
  PERSON_FALLBACK_URL,
  MOVIE_POSTER_FALLBACK_URL,
  TV_POSTER_FALLBACK_URL,
  TMDB_IMAGE_BASE_URL,
} from '../common/app.constants';

export const getImage = (
  path: string | null | undefined,
  type: 'movie_poster' | 'series_poster' | 'person' | 'watch_provider',
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
  return `${TMDB_IMAGE_BASE_URL}${path}`;
};
