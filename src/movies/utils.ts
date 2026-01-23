import { TMDB_MovieInfo, TMDB_Videos } from 'src/models/thirdparty/tmdb';

export const formatDuration = (minutes?: number) => {
  if (typeof minutes !== 'number') return 'N/A';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
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

export const cleanRating = (
  rating: number | undefined,
  postfix: string = '',
): string => {
  if (typeof rating !== 'number') return 'N/A';
  return Math.floor(rating * 10) / 10 + postfix; // truncate to 1 decimal place
};

export const findCertification = (
  releaseDates: TMDB_MovieInfo['release_dates'],
) => {
  const US_certification =
    releaseDates.results.find((result) => result.iso_3166_1 === 'US')
      ?.release_dates[0].certification || 'N/A';

  return US_certification;
};
