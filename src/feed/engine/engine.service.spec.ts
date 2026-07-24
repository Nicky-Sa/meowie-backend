import { describe, expect, it } from '@jest/globals';
import { EngineService } from '@/feed/engine/engine.service';
import { CandidateGenerator } from '@/feed/engine/candidate-generator';
import {
  FeedCandidate,
  FeedCandidateSource,
  FeedContext,
} from '@/feed/engine/engine.types';
import { rankingWeightsFor, sourceSharesFor } from '@/feed/feed.constants';

const candidate = (id: number, source: FeedCandidateSource): FeedCandidate => ({
  id,
  mediaType: 'movie',
  genreIds: [],
  voteAverage: 5,
  voteCount: 100,
  popularity: 10,
  releaseYear: 2020,
  source,
});

const candidates = (
  fromId: number,
  count: number,
  source: FeedCandidateSource,
): FeedCandidate[] =>
  Array.from({ length: count }, (_, offset) =>
    candidate(fromId + offset, source),
  );

const contextWithLikedCount = (likedCount: number): FeedContext => ({
  userId: 1,
  mediaType: 'movie',
  profile: {
    genreIds: [{ id: 18, weight: 1 }],
    knownMovieIds: Array.from({ length: likedCount }, (_, offset) => ({
      id: 9000 + offset,
      weight: 1,
    })),
    knownSeriesIds: [],
  },
  taste: {
    hasTaste: true,
    genreIds: [18],
    movieIds: [],
    seriesIds: [],
    avoid: [],
    exploreLevel: 2,
    era: null,
    reality: null,
    tasteAuthority: null,
    commitment: null,
  },
  avoid: { genreIds: new Set(), keywordIds: [], movieMaxRuntime: null },
  excludeIds: new Set(),
  served: new Set(),
  shuffleSeed: 1,
  nextTmdbPageToFetch: 1,
});

const engineFor = (batch: FeedCandidate[]): EngineService => {
  const generator = {
    generate: () => Promise.resolve(batch),
  } as unknown as CandidateGenerator;
  return new EngineService(generator, [], []);
};

const countBySource = (ids: number[], sourceIds: Set<number>): number =>
  ids.filter((id) => sourceIds.has(id)).length;

describe('EngineService source mixing', () => {
  const tasteBatch = candidates(1, 40, 'taste');
  const similarBatch = candidates(101, 40, 'similar');
  const popularBatch = candidates(201, 20, 'popular');
  const similarIds = new Set(similarBatch.map((item) => item.id));
  const popularIds = new Set(popularBatch.map((item) => item.id));

  it('keeps popular titles on the first page even with a one-item library', async () => {
    const engine = engineFor([...tasteBatch, ...similarBatch, ...popularBatch]);
    const firstPage = (await engine.buildBatch(contextWithLikedCount(1))).slice(
      0,
      20,
    );

    expect(countBySource(firstPage, popularIds)).toBeGreaterThanOrEqual(3);
    expect(countBySource(firstPage, similarIds)).toBeLessThanOrEqual(2);
  });

  it('gives the similar source its full share once the library is big enough', async () => {
    const engine = engineFor([...tasteBatch, ...similarBatch, ...popularBatch]);
    const firstPage = (
      await engine.buildBatch(contextWithLikedCount(10))
    ).slice(0, 20);

    const similarCount = countBySource(firstPage, similarIds);
    expect(similarCount).toBeGreaterThanOrEqual(3);
    expect(similarCount).toBeLessThanOrEqual(5);
  });

  it('emits a title only once when several sources find it', async () => {
    const shared = 777;
    const engine = engineFor([
      candidate(shared, 'taste'),
      candidate(shared, 'popular'),
      ...candidates(1, 5, 'taste'),
    ]);
    const batch = await engine.buildBatch(contextWithLikedCount(0));

    expect(batch.filter((id) => id === shared)).toHaveLength(1);
    expect(new Set(batch).size).toBe(batch.length);
  });

  it('lets the other sources fill in when one runs dry', async () => {
    const engine = engineFor([
      ...candidates(1, 2, 'taste'),
      ...candidates(201, 5, 'popular'),
    ]);
    const batch = await engine.buildBatch(contextWithLikedCount(0));

    expect(batch).toHaveLength(7);
  });
});

describe('sourceSharesFor', () => {
  it('hands the similar share back to taste discovery for an empty library', () => {
    const shares = sourceSharesFor(2, 0);

    expect(shares.similar).toBe(0);
    expect(shares.taste + shares.similar + shares.popular).toBeCloseTo(1);
  });

  it('caps the similar share at the full-library size', () => {
    expect(sourceSharesFor(2, 50).similar).toBe(sourceSharesFor(2, 10).similar);
  });

  it('grows the popular share with the explore level', () => {
    expect(sourceSharesFor(4, 10).popular).toBeGreaterThan(
      sourceSharesFor(0, 10).popular,
    );
  });
});

describe('rankingWeightsFor', () => {
  it('clamps the explore level into range', () => {
    expect(rankingWeightsFor(99)).toEqual(rankingWeightsFor(4));
    expect(rankingWeightsFor(-1)).toEqual(rankingWeightsFor(0));
  });

  it('loosens genre matching and raises shuffle as exploring grows', () => {
    const tight = rankingWeightsFor(0);
    const loose = rankingWeightsFor(4);

    expect(loose.genreMatch).toBeLessThan(tight.genreMatch);
    expect(loose.shuffle).toBeGreaterThan(tight.shuffle);
  });
});
