export const TMDB_BASE_URL = 'https://api.themoviedb.org';
export const WHATSON_BASE_URL = 'https://whatson-api.onrender.com';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
export const MOVIE_POSTER_FALLBACK_URL =
  'https://meowie-public.s3.eu-central-1.amazonaws.com/movie-poster-fallback.png';
export const TV_POSTER_FALLBACK_URL =
  'https://meowie-public.s3.eu-central-1.amazonaws.com/tv-poster-fallback.png';
export const PERSON_FALLBACK_URL =
  'https://meowie-public.s3.eu-central-1.amazonaws.com/person-fallback.png';
export const LIMIT = 20;
export const DEFAULT_BLURHASH = 'L18z.G~qRkxakWofofkCD%RjNGj[';

// durations in seconds
export enum Duration {
  ONE_SECOND = 1,
  TEN_SECONDS = 10,
  ONE_MINUTE = 60,
  ONE_HOUR = 3600,
  ONE_DAY = 3600 * 24,
  ONE_WEEK = 3600 * 24 * 7,
  ONE_MONTH = 3600 * 24 * 30,
  ONE_YEAR = 3600 * 24 * 365,
}
