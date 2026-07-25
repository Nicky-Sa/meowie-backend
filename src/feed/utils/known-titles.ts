import { LibraryItem } from '@/library/entities/library-item.entity';
import { TasteForFeed } from '@/taste/types/taste.type';
import { MediaType } from '@/types/media-type';
import { LikedTitle } from '@/feed/types/feed.types';

// Assumes a 1–5 star rating scale. The weight ranks a title as a source for
// similar titles: saved is a mild signal, ratings scale from the midpoint
// (3★ = 0, 5★ = +1, 1★ = -1).
const MAX_RATING = 5;
const RATING_MIDPOINT = 3;
const SAVED_WEIGHT = 0.5;
const SEEN_UNRATED_WEIGHT = 0.3;

// Below every positive library weight, so real saves and ratings always take
// the similar-title slots first.
const PICKED_TITLE_WEIGHT = 0.2;

const libraryWeight = (item: LibraryItem): number => {
  if (item.category === 'saved') return SAVED_WEIGHT;
  if (item.rating != null) {
    return (item.rating - RATING_MIDPOINT) / (MAX_RATING - RATING_MIDPOINT);
  }
  return SEEN_UNRATED_WEIGHT;
};

/**
 * Every title the user already knows for this media type, with how strongly
 * they like it. A title in both the library and the wizard picks sums both.
 */
export const knownTitlesFor = (
  taste: TasteForFeed,
  libraryItems: LibraryItem[],
  mediaType: MediaType,
): LikedTitle[] => {
  const weightById = new Map<number, number>();
  const add = (id: number, weight: number) =>
    weightById.set(id, (weightById.get(id) ?? 0) + weight);

  const pickedIds = mediaType === 'movie' ? taste.movieIds : taste.seriesIds;
  pickedIds.forEach((id) => add(id, PICKED_TITLE_WEIGHT));
  libraryItems.forEach((item) => add(item.tmdbId, libraryWeight(item)));

  return [...weightById].map(([id, weight]) => ({ id, weight }));
};
