import { describe, expect, it } from '@jest/globals';
import { seedsStage } from '@/feed/engine/1-seeds/seeds.stage';

const now = new Date('2026-08-16T12:00:00.000Z');

describe('seedsStage.run', () => {
  it('builds known titles and the two walk inputs in stage order', () => {
    expect(
      seedsStage.run({
        now,
        tasteRatings: {
          1: 'like',
          2: 'dislike',
          3: 'not-seen',
          4: 'like',
        },
        libraryItems: [
          {
            tmdbId: 1,
            category: 'seen',
            rating: 10,
            createdAt: now,
          },
          {
            tmdbId: 2,
            category: 'seen',
            rating: 1,
            createdAt: now,
          },
          {
            tmdbId: 5,
            category: 'saved',
            rating: null,
            createdAt: now,
          },
        ],
      }),
    ).toEqual({
      allSeeds: [
        { id: 1, weight: 1 },
        { id: 2, weight: -1 },
        { id: 4, weight: 0.2 },
        { id: 5, weight: 0.5 },
      ],
      positiveSeeds: [
        { id: 1, weight: 1 },
        { id: 5, weight: 0.5 },
        { id: 4, weight: 0.2 },
      ],
      negativeSeeds: [{ id: 2, weight: -1 }],
    });
  });

  it('lets the library replace a taste-deck like with a negative rating', () => {
    expect(
      seedsStage.run({
        now,
        tasteRatings: {
          7: 'like',
        },
        libraryItems: [
          {
            tmdbId: 7,
            category: 'seen',
            rating: 5,
            createdAt: now,
          },
        ],
      }).allSeeds,
    ).toEqual([{ id: 7, weight: -1 / 9 }]);
  });

  it('lets the library replace a taste-deck dislike with a positive rating', () => {
    expect(
      seedsStage.run({
        now,
        tasteRatings: {
          7: 'dislike',
        },
        libraryItems: [
          {
            tmdbId: 7,
            category: 'seen',
            rating: 10,
            createdAt: now,
          },
        ],
      }).allSeeds,
    ).toEqual([{ id: 7, weight: 1 }]);
  });

  it('uses the shared rating scale and fixed unrated library weights', () => {
    expect(
      seedsStage.run({
        now,
        tasteRatings: {},
        libraryItems: [
          {
            tmdbId: 10,
            category: 'seen',
            rating: 10,
            createdAt: now,
          },
          {
            tmdbId: 8,
            category: 'seen',
            rating: 8,
            createdAt: now,
          },
          {
            tmdbId: 5,
            category: 'seen',
            rating: 5,
            createdAt: now,
          },
          {
            tmdbId: 1,
            category: 'seen',
            rating: 1,
            createdAt: now,
          },
          {
            tmdbId: 101,
            category: 'saved',
            rating: null,
            createdAt: now,
          },
          {
            tmdbId: 202,
            category: 'seen',
            rating: null,
            createdAt: now,
          },
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

  it('decays library weights with age', () => {
    const oneYearAgo = new Date('2025-08-16T12:00:00.000Z');

    const result = seedsStage.run({
      now,
      tasteRatings: {},
      libraryItems: [
        {
          tmdbId: 10,
          category: 'seen',
          rating: 10,
          createdAt: oneYearAgo,
        },
      ],
    });

    expect(result.allSeeds[0].weight).toBeCloseTo(0.5, 3);
  });

  it('applies recency before picking the strongest positive seeds', () => {
    const oneYearAgo = new Date('2025-08-16T12:00:00.000Z');

    const result = seedsStage.run({
      now,
      tasteRatings: {},
      libraryItems: [
        {
          tmdbId: 1,
          category: 'seen',
          rating: 10,
          createdAt: oneYearAgo,
        },
        {
          tmdbId: 2,
          category: 'seen',
          rating: 8,
          createdAt: now,
        },
      ],
    });

    expect(result.positiveSeeds).toEqual([
      {
        id: 2,
        weight: 5 / 9,
      },
      {
        id: 1,
        weight: expect.closeTo(0.5, 3),
      },
    ]);
  });

  it('does not turn not-seen titles into seeds', () => {
    expect(
      seedsStage.run({
        now,
        tasteRatings: {
          1: 'not-seen',
        },
        libraryItems: [],
      }),
    ).toEqual({
      allSeeds: [],
      positiveSeeds: [],
      negativeSeeds: [],
    });
  });

  it('caps the positive and negative walks', () => {
    const positive = Array.from({ length: 31 }, (_, index) => ({
      tmdbId: index + 1,
      category: 'seen' as const,
      rating: 10,
      createdAt: now,
    }));

    const negative = Array.from({ length: 11 }, (_, index) => ({
      tmdbId: index + 101,
      category: 'seen' as const,
      rating: 1,
      createdAt: now,
    }));

    const result = seedsStage.run({
      now,
      tasteRatings: {},
      libraryItems: [...positive, ...negative],
    });

    expect(result.positiveSeeds).toHaveLength(30);
    expect(result.negativeSeeds).toHaveLength(10);
  });
});
