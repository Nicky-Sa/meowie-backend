export class CastInfo {
  id: number;
  name: string;
  character: string;
  creditId: string;
  profilePath: string;
}

export class Credits {
  casts: CastInfo[];
  director: CastInfo;
}

export class MoviePosterInfo {
  id: number;
  posterPath: string;
  blurhash: string;
}
