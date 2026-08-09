import { LibraryItem } from '@/library/entities/library-item.entity';
import { TasteForFeed } from '@/taste/types/taste.type';
import { MediaType } from '@/types/media-type';
import { KnownTitle } from '@/feed/types/feed.types';
import {
  HIGHEST_RATING,
  LOWEST_RATING,
} from '@/library/constants/library.constants';

// Taken from the library's own scale so the two can't drift apart again.
// The middle of the scale scores 0, the top +1, the bottom -1.
const RATING_MIDPOINT = (LOWEST_RATING + HIGHEST_RATING) / 2;
const SAVED_WEIGHT = 0.5;
// Under the weight of the lowest rating still above the midpoint, so watching
// something and saying nothing never counts for more than a lukewarm score.
const SEEN_UNRATED_WEIGHT = 0.1;

// A taste-deck answer is only like or dislike, with no strength behind it, so
// it stays small next to a real save or rating.
const RATED_TITLE_WEIGHT = 0.2;

const libraryWeight = (item: LibraryItem): number => {
  if (item.category === 'saved') return SAVED_WEIGHT;
  if (item.rating != null) {
    return (item.rating - RATING_MIDPOINT) / (HIGHEST_RATING - RATING_MIDPOINT);
  }
  return SEEN_UNRATED_WEIGHT;
};

// "Haven't seen it" is left out on purpose: it says nothing about their taste,
// and a title they never watched is still worth showing them.
export const knownTitlesFor = (
  taste: TasteForFeed,
  libraryItems: LibraryItem[],
  mediaType: MediaType,
): KnownTitle[] => {
  const weightById = new Map<number, number>();
  const add = (id: number, weight: number) =>
    weightById.set(id, (weightById.get(id) ?? 0) + weight);

  const ratings =
    mediaType === 'movie' ? taste.movieRatings : taste.seriesRatings;
  Object.entries(ratings).forEach(([tmdbId, answer]) => {
    if (answer === 'like') add(Number(tmdbId), RATED_TITLE_WEIGHT);
    if (answer === 'dislike') add(Number(tmdbId), -RATED_TITLE_WEIGHT);
  });
  libraryItems.forEach((item) => add(item.tmdbId, libraryWeight(item)));

  return [...weightById].map(([id, weight]) => ({ id, weight }));
};
