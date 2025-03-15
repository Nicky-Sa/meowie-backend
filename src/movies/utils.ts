import { TMDB_Videos } from 'src/movies/models/tmdb/info';

export const formatDuration = (minutes?: number) => {
  if (typeof minutes !== 'number') return 'N/A';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h${remainingMinutes}m`;
};

export const findTrailerKey = (videoList: TMDB_Videos): string => {
  const { results } = videoList;
  const youtubeVideos = results.filter((video) => video.site === 'YouTube');

  if (!youtubeVideos) {
    return '';
  }
  // 1. Look for a video that is both Trailer and Official
  const officialTrailer = youtubeVideos.find(
    (video) => video.type === 'Trailer' && video.official,
  )?.key;

  if (officialTrailer) {
    return officialTrailer;
  }

  // 2. Look for a video that is a Trailer (regardless of official status)
  const trailer = youtubeVideos.find((video) => video.type === 'Trailer')?.key;

  if (trailer) {
    return trailer;
  }

  // 3. Return the first video in the list (if any)
  return youtubeVideos.length > 0 ? youtubeVideos[0].key : '';
};
