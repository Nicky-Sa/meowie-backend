import {
  TMDB_Genre,
  TMDB_MediaType,
  TMDB_MovieInfo,
  TMDB_Videos,
} from '@/tmdb/tmdb.type';
import { CreditInfo } from '@/types/credit';
import { PERSON_FALLBACK_URL } from '@/common/app.constants';
import { getImageWithFallback } from '@/images/images.utils';
import { GENRES } from '@/constants/items/genres.constant';
import { MediaType } from '@/types/media-type';

export const emptyCredit: CreditInfo = {
  id: -1,
  name: 'N/A',
  role: '',
  profilePath: PERSON_FALLBACK_URL,
  creditId: '',
};

export const findTrailerKey = (videoList: TMDB_Videos): string => {
  const { results } = videoList;
  const youtubeVideos = results.filter((video) => video.site === 'YouTube');

  if (!youtubeVideos) {
    return '';
  }

  const trailers = youtubeVideos.filter((video) => video.type === 'Trailer');
  // 1. Look for a video that is both Trailer and Official
  const officialTrailer = trailers.find((video) => video.official)?.key;

  if (officialTrailer) {
    return officialTrailer;
  }

  // 2. Look for a video that is a Trailer (regardless of official status)
  const trailer = trailers[0]?.key;

  if (trailer) {
    return trailer;
  }

  // 3. Return the first video in the list (if any)
  return youtubeVideos[0]?.key ?? '';
};

export const formatDuration = (minutes?: number) => {
  if (typeof minutes !== 'number') return 'N/A';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const getGenreEmoji = (id: number) => {
  return GENRES.find((genre) => genre.id === id)?.emoji ?? '🍿';
};

export const formatGenres = (genreIds: TMDB_Genre[]) => {
  return genreIds.map((genre) => ({
    ...genre,
    emoji: getGenreEmoji(genre.id),
  }));
};

export const formatCasts = (
  tmdbCasts: TMDB_MovieInfo['credits']['cast'],
): CreditInfo[] => {
  // 1. Deduplicate first using a Map (Key = ID, Value = Object)
  const uniqueCastMap = new Map(tmdbCasts.map((cast) => [cast.id, cast]));
  // 2. Convert back to array and chain your logic
  return [...uniqueCastMap.values()]
    .filter((cast) => cast.known_for_department === 'Acting')
    .sort((a, b) => a.order - b.order)
    .map((cast) => ({
      id: cast.id,
      name: cast.name,
      role: cast.character,
      creditId: cast.credit_id,
      profilePath: getImageWithFallback(cast.profile_path, 'person'),
    }));
};

export const formatCrew = (
  tmdbCrew: TMDB_MovieInfo['credits']['crew'],
): CreditInfo[] => {
  const uniqueCrewMap = new Map(tmdbCrew.map((crew) => [crew.id, crew]));
  return [...uniqueCrewMap.values()]
    .sort((a, b) => b.popularity - a.popularity)
    .map((crew) => ({
      id: crew.id,
      name: crew.name,
      role: crew.job,
      creditId: crew.credit_id,
      profilePath: getImageWithFallback(crew.profile_path, 'person'),
    }));
};

export const tmdbMediaTypeToAppMediaType = (
  tmdbMediaType: TMDB_MediaType,
): MediaType => {
  switch (tmdbMediaType) {
    case 'tv':
      return 'series';
    default:
      return tmdbMediaType;
  }
};
