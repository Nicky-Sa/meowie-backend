import { MediaType } from '@/types/media-type';

export type WeightedId = {
  id: number;
  weight: number;
};

export type FeedProfileContribution = {
  genreIds: WeightedId[];
  libraryMovieIds: WeightedId[];
  librarySeriesIds: WeightedId[];
};

export type FeedProfile = {
  genreIds: WeightedId[];
  libraryMovieIds: WeightedId[];
  librarySeriesIds: WeightedId[];
};

/** Library items that count as positive signal — they fuel the similar source. */
export const positiveLibraryItemsFor = (
  profile: FeedProfile,
  mediaType: MediaType,
): WeightedId[] => {
  const items =
    mediaType === 'movie' ? profile.libraryMovieIds : profile.librarySeriesIds;
  return items.filter((item) => item.weight > 0);
};
