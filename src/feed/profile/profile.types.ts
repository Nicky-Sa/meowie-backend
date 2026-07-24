import { MediaType } from '@/types/media-type';

export type WeightedId = {
  id: number;
  weight: number;
};

export type FeedProfileContribution = {
  genreIds: WeightedId[];
  knownMovieIds: WeightedId[];
  knownSeriesIds: WeightedId[];
};

export type FeedProfile = {
  genreIds: WeightedId[];
  knownMovieIds: WeightedId[];
  knownSeriesIds: WeightedId[];
};

/** Titles the user likes — saved, well rated, or picked in the wizard. */
export const likedTitlesFor = (
  profile: FeedProfile,
  mediaType: MediaType,
): WeightedId[] => {
  const items =
    mediaType === 'movie' ? profile.knownMovieIds : profile.knownSeriesIds;
  return items.filter((item) => item.weight > 0);
};
