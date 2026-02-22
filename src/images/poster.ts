import { MediaType } from '../types/media-type';

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
}
