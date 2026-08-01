import { describe, expect, it } from '@jest/globals';
import { BatchBuilderService } from '@/feed/batch-builder.service';
import { TitleFinderService } from '@/feed/title-finder.service';
import {
  FeedCandidate,
  FeedCandidateSource,
  FeedContext,
} from '@/feed/types/feed.types';
import {
  rankingWeightsFor,
  sourceSharesFor,
} from '@/feed/constants/feed.constant';

const candidate = (id: number, source: FeedCandidateSource): FeedCandidate => ({
  id,
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
  mediaType: 'movie',
  likedTitles: Array.from({ length: likedCount }, (_, offset) => ({
    id: 9000 + offset,
    weight: 1,
  })),
  taste: {
    movieRatings: {},
    seriesRatings: {},
    avoid: [],
    exploreLevel: 2,
    era: 'both',
    authority: 'both',
  },
  avoid: {
    blockedGenreIds: new Set(),
    blockedKeywordIds: [],
  },
  excludeIds: new Set(),
  closeToDisliked: new Set(),
  hiddenIds: new Set(),
  shuffleSeed: 1,
  nextTmdbPageToFetch: 1,
});

const builderFor = (batch: FeedCandidate[]): BatchBuilderService => {
  const titleFinder = {
    find: () => Promise.resolve(batch),
  } as unknown as TitleFinderService;
  return new BatchBuilderService(titleFinder);
};

const countBySource = (ids: number[], sourceIds: Set<number>): number =>
  ids.filter((id) => sourceIds.has(id)).length;

describe('BatchBuilderService source mixing', () => {
  const tasteBatch = candidates(1, 40, 'taste');
  const similarBatch = candidates(101, 40, 'similar');
  const popularBatch = candidates(201, 20, 'popular');
  const tasteIds = new Set(tasteBatch.map((item) => item.id));
  const similarIds = new Set(similarBatch.map((item) => item.id));
  const popularIds = new Set(popularBatch.map((item) => item.id));

  it('keeps popular titles on the first page even with a one-item library', async () => {
    const builder = builderFor([
      ...tasteBatch,
      ...similarBatch,
      ...popularBatch,
    ]);
    const firstPage = (await builder.build(contextWithLikedCount(1))).slice(
      0,
      20,
    );

    expect(countBySource(firstPage, popularIds)).toBeGreaterThanOrEqual(3);
    expect(countBySource(firstPage, similarIds)).toBeLessThanOrEqual(2);
  });

  it('lets the similar source lead the page once enough titles are liked', async () => {
    const builder = builderFor([
      ...tasteBatch,
      ...similarBatch,
      ...popularBatch,
    ]);
    const firstPage = (await builder.build(contextWithLikedCount(10))).slice(
      0,
      20,
    );

    expect(countBySource(firstPage, similarIds)).toBeGreaterThan(
      countBySource(firstPage, tasteIds),
    );
    expect(countBySource(firstPage, similarIds)).toBeGreaterThan(
      countBySource(firstPage, popularIds),
    );
  });

  it('emits a title only once when several sources find it', async () => {
    const shared = 777;
    const builder = builderFor([
      candidate(shared, 'taste'),
      candidate(shared, 'popular'),
      ...candidates(1, 5, 'taste'),
    ]);
    const batch = await builder.build(contextWithLikedCount(0));

    expect(batch.filter((id) => id === shared)).toHaveLength(1);
    expect(new Set(batch).size).toBe(batch.length);
  });

  it('lets the other sources fill in when one runs dry', async () => {
    const builder = builderFor([
      ...candidates(1, 2, 'taste'),
      ...candidates(201, 5, 'popular'),
    ]);
    const batch = await builder.build(contextWithLikedCount(0));

    expect(batch).toHaveLength(7);
  });
});

// Ranking decides the order inside a source, so these check membership only.
const sortedIds = (ids: number[]): number[] =>
  [...ids].sort((first, second) => first - second);

describe('BatchBuilderService filtering', () => {
  it('drops titles the user has already been shown', async () => {
    const context = contextWithLikedCount(0);
    context.hiddenIds.add(2);
    const builder = builderFor(candidates(1, 3, 'taste'));

    expect(sortedIds(await builder.build(context))).toEqual([1, 3]);
  });

  it('drops titles the user already knows', async () => {
    const context = contextWithLikedCount(0);
    context.excludeIds.add(3);
    const builder = builderFor(candidates(1, 3, 'taste'));

    expect(sortedIds(await builder.build(context))).toEqual([1, 2]);
  });

  it('drops titles carrying an avoided genre', async () => {
    const context = contextWithLikedCount(0);
    context.avoid.blockedGenreIds.add(27);
    const horror = { ...candidate(9, 'popular'), genreIds: [27, 18] };
    const builder = builderFor([...candidates(1, 2, 'taste'), horror]);

    expect(await builder.build(context)).not.toContain(9);
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

  it('softens the push away from dislikes and raises shuffle as exploring grows', () => {
    const tight = rankingWeightsFor(0);
    const loose = rankingWeightsFor(4);

    expect(loose.closeToDisliked).toBeLessThan(tight.closeToDisliked);
    expect(loose.shuffle).toBeGreaterThan(tight.shuffle);
  });
});
