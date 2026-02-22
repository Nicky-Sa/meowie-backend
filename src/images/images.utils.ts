import {
  PERSON_FALLBACK_URL,
  POSTER_FALLBACK_URL,
  TMDB_IMAGE_BASE_URL,
} from '../common/app.constants';
import { PosterInfo } from './poster';

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

export const mapToPosters = (
  items: { id: number; poster_path: string | null }[],
): PosterInfo[] => {
  const blurhash = 'U11o;?of00of00of00of00of00of00of00of'; // shared static blurhash
  return items.map((item) => ({
    id: item.id,
    posterPath: getImage(item.poster_path, 'poster'),
    blurhash,
  }));
};
