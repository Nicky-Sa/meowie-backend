import { describe, expect, it } from '@jest/globals';
import { seedsStage } from '@/feed/engine/1-seeds/seeds.stage';

describe('seedsStage.run', () => {
  it('builds known titles and the two walk inputs in stage order', () => {
    expect(
      seedsStage.run({
        tasteRatings: {
          1: 'like',
          2: 'dislike',
          3: 'not-seen',
          4: 'like',
        },
        libraryItems: [
          { tmdbId: 1, category: 'seen', rating: 10 },
          { tmdbId: 2, category: 'seen', rating: 1 },
          { tmdbId: 5, category: 'saved', rating: null },
        ],
      }),
    ).toEqual({
      allSeeds: [
        { id: 1, weight: 1 },
        { id: 2, weight: -1 },
        { id: 4, weight: 0.2 },
        { id: 5, weight: 0.5 },
      ],
      likedSeeds: [
        { id: 1, weight: 1 },
        { id: 5, weight: 0.5 },
        { id: 4, weight: 0.2 },
      ],
      dislikedSeeds: [{ id: 2, weight: -1 }],
    });
  });

  it('keeps the library weight when a title is also in the taste deck', () => {
    expect(
      seedsStage.run({
        tasteRatings: { 7: 'like', 8: 'dislike' },
        libraryItems: [
          { tmdbId: 7, category: 'seen', rating: 5 },
          { tmdbId: 8, category: 'saved', rating: null },
        ],
      }).allSeeds,
    ).toEqual([
      { id: 7, weight: -1 / 9 },
      { id: 8, weight: 0.5 },
    ]);
  });

  it('uses the shared rating scale and fixed unrated library weights', () => {
    expect(
      seedsStage.run({
        tasteRatings: {},
        libraryItems: [
          { tmdbId: 10, category: 'seen', rating: 10 },
          { tmdbId: 8, category: 'seen', rating: 8 },
          { tmdbId: 5, category: 'seen', rating: 5 },
          { tmdbId: 1, category: 'seen', rating: 1 },
          { tmdbId: 101, category: 'saved', rating: null },
          { tmdbId: 202, category: 'seen', rating: null },
        ],
      }).allSeeds,
    ).toEqual([
      { id: 10, weight: 1 },
      { id: 8, weight: 5 / 9 },
      { id: 5, weight: -1 / 9 },
      { id: 1, weight: -1 },
      { id: 101, weight: 0.5 },
      { id: 202, weight: 0.1 },
    ]);
  });

  it('caps the positive and negative walks', () => {
    const liked = Array.from({ length: 31 }, (_, index) => ({
      tmdbId: index + 1,
      category: 'seen' as const,
      rating: 10,
    }));
    const disliked = Array.from({ length: 11 }, (_, index) => ({
      tmdbId: index + 101,
      category: 'seen' as const,
      rating: 1,
    }));

    const result = seedsStage.run({
      tasteRatings: {},
      libraryItems: [...liked, ...disliked],
    });

    expect(result.likedSeeds).toHaveLength(30);
    expect(result.dislikedSeeds).toHaveLength(10);
  });
});
