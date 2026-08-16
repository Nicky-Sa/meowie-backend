import { describe, expect, it } from '@jest/globals';
import { generateStage } from '@/feed/engine/2-generate/generate.stage';

describe('generateStage.run', () => {
  it('keeps the positive and negative walks separate alongside popular candidates', async () => {
    const result = await generateStage.run({
      positiveSeeds: [{ id: 1, weight: 1 }],
      negativeSeeds: [{ id: 2, weight: -1 }],
      popular: {
        mediaType: 'movie',
        titles: [
          {
            id: 3,
            genreIds: [18],
            voteCount: 500,
            runtimeMinutes: 120,
          },
        ],
      },
      getNeighbours: (id) => {
        if (id === 1) return Promise.resolve([10]);
        if (id === 2) return Promise.resolve([20]);
        return Promise.resolve([]);
      },
    });

    expect(result.positiveWalk).toEqual(
      expect.arrayContaining([{ id: 10, weight: expect.closeTo(1.12) }]),
    );
    expect(result.negativeWalk).toEqual(
      expect.arrayContaining([{ id: 20, weight: expect.closeTo(1.12) }]),
    );
    expect(result.popularCandidates).toEqual([
      {
        id: 3,
        genreIds: [18],
        voteCount: 500,
        runtimeMinutes: 120,
        mediaType: 'movie',
        isPopular: true,
      },
    ]);
  });
});
