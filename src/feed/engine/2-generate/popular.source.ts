import {
  PopularCandidate,
  PopularSourceInput,
  PopularSourceOutput,
} from '@/feed/engine/2-generate/popular.types';

/**
 * Turns the media-type-specific popular list into an unscored candidate source.
 *
 * Popularity is deliberately a flag, not a score. Phase 3 will decide how much
 * the source contributes after it has been merged with the two walk signals.
 */
export const popularSource = (
  input: PopularSourceInput,
): PopularSourceOutput => {
  switch (input.mediaType) {
    case 'movie':
      return input.titles.map(
        (title): PopularCandidate => ({
          ...title,
          genreIds: [...title.genreIds],
          mediaType: 'movie',
          isPopular: true,
        }),
      );
    case 'series':
      return input.titles.map(
        (title): PopularCandidate => ({
          ...title,
          genreIds: [...title.genreIds],
          mediaType: 'series',
          isPopular: true,
        }),
      );
  }
};
