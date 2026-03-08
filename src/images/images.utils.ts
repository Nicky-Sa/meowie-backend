import {
  PERSON_FALLBACK_URL,
  MOVIE_POSTER_FALLBACK_URL,
  TV_POSTER_FALLBACK_URL,
  TMDB_IMAGE_BASE_URL,
} from '../common/app.constants';

export const getImage = (
  path: string | null | undefined,
  type: 'movie_poster' | 'tv_poster' | 'person',
) => {
  if (!path) {
    switch (type) {
      case 'movie_poster':
        return MOVIE_POSTER_FALLBACK_URL;
      case 'tv_poster':
        return TV_POSTER_FALLBACK_URL;
      case 'person':
        return PERSON_FALLBACK_URL;
    }
  }
  return `${TMDB_IMAGE_BASE_URL}${path}`;
};
