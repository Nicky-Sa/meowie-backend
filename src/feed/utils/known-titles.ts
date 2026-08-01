import { LibraryItem } from '@/library/entities/library-item.entity';
import { TasteForFeed } from '@/taste/types/taste.type';
import { MediaType } from '@/types/media-type';
import { KnownTitle } from '@/feed/types/feed.types';

// Assumes a 1–5 star rating scale. The weight ranks a title as a source for
// similar titles: saved is a mild signal, ratings scale from the midpoint
// (3★ = 0, 5★ = +1, 1★ = -1).
const MAX_RATING = 5;
const RATING_MIDPOINT = 3;
const SAVED_WEIGHT = 0.5;
const SEEN_UNRATED_WEIGHT = 0.3;

// Below every positive library weight, so real saves and ratings always take
// the similar-title slots first.
const RATED_TITLE_WEIGHT = 0.2;

const libraryWeight = (item: LibraryItem): number => {
  if (item.category === 'saved') return SAVED_WEIGHT;
  if (item.rating != null) {
    return (item.rating - RATING_MIDPOINT) / (MAX_RATING - RATING_MIDPOINT);
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
