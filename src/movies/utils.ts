import { TMDB_ReleaseDates, TMDB_Videos } from 'src/models/thirdparty/tmdb';
import { extractYearFromDate } from '../utils/functions/dates';

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
  releaseDates: TMDB_ReleaseDates,
  country: string = 'US',
) => {
  const certification =
    releaseDates.results.find((result) => result.iso_3166_1 === country)
      ?.release_dates[0].certification || 'N/A';

  return certification;
};

export const screeningStatus = (
  releaseDate: string,
  releaseDates: TMDB_ReleaseDates,
  country: string = 'US',
): string => {
  const fallback = extractYearFromDate(releaseDate);
  const data = releaseDates.results.find(
    (result) => result.iso_3166_1 === country,
  );

  if (!data) return fallback;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Check for Premiere Event (Type 1) - STRICTLY TODAY
  const premiere = data.release_dates.find((d) => d.type === 1);
  if (premiere) {
    const premiereDate = new Date(premiere.release_date);
    if (premiereDate.toDateString() === today.toDateString()) {
      return 'Premiere';
    }
  }

  // 2. Find the EARLIEST Public Release (Types 2, 3, 4, 5, 6)
  // We filter out Type 1 (Premiere) because that doesn't count as "publicly released".
  const publicReleases = data.release_dates
    .filter((d) => d.type >= 2 && d.type <= 6)
    .sort(
      (a, b) =>
        new Date(a.release_date).getTime() - new Date(b.release_date).getTime(),
    );

  if (publicReleases.length === 0) return fallback;

  const firstRelease = publicReleases[0];
  const firstReleaseDate = new Date(firstRelease.release_date);

  // 3. Upcoming Check (Applies to ANY release type)
  if (firstReleaseDate > today) {
    return 'Upcoming';
  }

  // 4. In Cinemas Check (Only applies if it WAS a theatrical release)
  // We still need to find the specific theatrical entry to check the 60-day window.
  const theatricalRelease =
    data.release_dates.find((d) => d.type === 3) ||
    data.release_dates.find((d) => d.type === 2);

  if (theatricalRelease) {
    const theatricalDate = new Date(theatricalRelease.release_date);
    const diffTime = today.getTime() - theatricalDate.getTime();
    const daysSinceRelease = diffTime / (1000 * 60 * 60 * 24);

    if (daysSinceRelease >= 0 && daysSinceRelease <= 60) {
      return 'In cinemas';
    }
  }

  return extractYearFromDate(firstRelease.release_date);
};
