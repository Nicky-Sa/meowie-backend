import {
  PERSON_FALLBACK_URL,
  POSTER_FALLBACK_URL,
  TMDB_IMAGE_BASE_URL,
} from '../../utils/constants';

export type PosterProps = {
  primaryColorHex: string;
  blurhash: string;
};

export const getImage = (
  path: string | null | undefined,
  type: 'poster' | 'profile',
) => {
  if (!path) {
    switch (type) {
      case 'poster':
        return POSTER_FALLBACK_URL;
      case 'profile':
        return PERSON_FALLBACK_URL;
    }
  }
  return `${TMDB_IMAGE_BASE_URL}${path}`;
};
