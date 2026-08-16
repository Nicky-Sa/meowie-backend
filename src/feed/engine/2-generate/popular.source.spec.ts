import { describe, expect, it } from '@jest/globals';
import { popularSource } from '@/feed/engine/2-generate/popular.source';

describe('popularSource', () => {
  it('turns popular movies into unscored movie candidates', () => {
    const result = popularSource({
      mediaType: 'movie',
      titles: [
        {
          id: 1,
          genreIds: [18, 878],
          voteCount: 500,
          runtimeMinutes: 148,
        },
      ],
    });

    expect(result).toEqual([
      {
        id: 1,
        genreIds: [18, 878],
        voteCount: 500,
        runtimeMinutes: 148,
        mediaType: 'movie',
        isPopular: true,
      },
    ]);
  });

  it('keeps series candidates separate from movies', () => {
    const result = popularSource({
      mediaType: 'series',
      titles: [
        {
          id: 2,
          genreIds: [18],
          voteCount: 250,
        },
      ],
    });

    expect(result).toEqual([
      {
        id: 2,
        genreIds: [18],
        voteCount: 250,
        mediaType: 'series',
        isPopular: true,
      },
    ]);
  });
});
