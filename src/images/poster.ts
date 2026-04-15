import { MediaType } from '../types/media-type';
import { Genre } from '../constants/items/genres.constant';

export class PosterProps {
  primaryColorHex: string;
  blurhash: string;
}

export class PosterInfo {
  id: number;
  posterPath: string;
  blurhash: string;
  mediaType: MediaType;
  role?: string;
  preview: {
    title: string;
    genres: Genre[];
    overview: string;
  };
}
