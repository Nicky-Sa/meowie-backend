import {
  PERSON_FALLBACK_URL,
  POSTER_FALLBACK_URL,
  TMDB_IMAGE_BASE_URL,
} from '../utils/constants';

export class PosterProps {
  primaryColorHex: string;
  blurhash: string;
}

export const getImage = (
  path: string | null | undefined,
  type: 'poster' | 'person',
) => {
  if (!path) {
    switch (type) {
      case 'poster':
        return POSTER_FALLBACK_URL;
      case 'person':
        return PERSON_FALLBACK_URL;
    }
  }
  return `${TMDB_IMAGE_BASE_URL}${path}`;
};
