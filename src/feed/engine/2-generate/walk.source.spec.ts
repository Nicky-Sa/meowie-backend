import { describe, expect, it } from '@jest/globals';
import { walkSource } from '@/feed/engine/2-generate/walk.source';

describe('walkSource', () => {
  it('follows recommendations across three rounds', async () => {
    const result = await walkSource({
      seeds: [{ id: 1, weight: 1 }],
      getNeighbours: (id) => {
        if (id === 1) return Promise.resolve([2]);
        if (id === 2) return Promise.resolve([3]);
        if (id === 3) return Promise.resolve([4]);
        return Promise.resolve([]);
      },
    });

    expect(result).toEqual([
      { id: 2, weight: expect.closeTo(1.12) },
      { id: 3, weight: expect.closeTo(0.768) },
      { id: 1, weight: expect.closeTo(0.6) },
      { id: 4, weight: expect.closeTo(0.512) },
    ]);
  });

  it('splits a title weight evenly between its neighbours', async () => {
    const result = await walkSource({
      seeds: [{ id: 1, weight: 1 }],
      getNeighbours: (id) => {
        if (id === 1) return Promise.resolve([2, 3]);
        return Promise.resolve([]);
      },
    });

    expect(result).toEqual([
      { id: 1, weight: expect.closeTo(0.6) },
      { id: 2, weight: expect.closeTo(0.56) },
      { id: 3, weight: expect.closeTo(0.56) },
    ]);
  });

  it('adds weight when multiple titles point to the same neighbour', async () => {
    const result = await walkSource({
      seeds: [
        { id: 1, weight: 1 },
        { id: 2, weight: 1 },
      ],
      getNeighbours: (id) => {
        if (id === 1) return Promise.resolve([3]);
        if (id === 2) return Promise.resolve([3]);
        return Promise.resolve([]);
      },
    });

    expect(result).toEqual([
      { id: 3, weight: expect.closeTo(1.12) },
      { id: 1, weight: expect.closeTo(0.3) },
      { id: 2, weight: expect.closeTo(0.3) },
    ]);
  });

  it('keeps titles outside the frontier in the next round', async () => {
    const seeds = Array.from({ length: 201 }, (_, index) => ({
      id: index + 1,
      weight: index + 1,
    }));

    const followedIds: number[] = [];

    const result = await walkSource({
      seeds,
      getNeighbours: (id) => {
        followedIds.push(id);

        if (id === 201) return Promise.resolve([999]);
        return Promise.resolve([]);
      },
    });

    expect(result).toEqual(
      expect.arrayContaining([{ id: 1, weight: expect.any(Number) }]),
    );
    expect(followedIds).toHaveLength(600);
    expect(followedIds.slice(0, 200)).not.toContain(1);
    expect(followedIds.slice(200, 400)).toContain(1);
  });

  it('retains restart shares when a title has no neighbours', async () => {
    const result = await walkSource({
      seeds: [{ id: 1, weight: 1 }],
      getNeighbours: () => Promise.resolve([]),
    });

    expect(result).toEqual([{ id: 1, weight: expect.closeTo(0.6) }]);
  });

  it('normalizes seed weights before spreading them', async () => {
    const result = await walkSource({
      seeds: [
        { id: 1, weight: 2 },
        { id: 2, weight: 1 },
      ],
      getNeighbours: (id) => {
        if (id === 1) return Promise.resolve([3]);
        if (id === 2) return Promise.resolve([4]);
        return Promise.resolve([]);
      },
    });

    expect(result).toEqual([
      { id: 3, weight: expect.closeTo(0.7466666666666667) },
      { id: 1, weight: expect.closeTo(0.4) },
      { id: 4, weight: expect.closeTo(0.37333333333333335) },
      { id: 2, weight: expect.closeTo(0.2) },
    ]);
  });

  it('uses the absolute value of seed weights when creating shares', async () => {
    const result = await walkSource({
      seeds: [
        { id: 1, weight: -2 },
        { id: 2, weight: -1 },
      ],
      getNeighbours: (id) => {
        if (id === 1) return Promise.resolve([3]);
        if (id === 2) return Promise.resolve([4]);
        return Promise.resolve([]);
      },
    });

    expect(result).toEqual([
      { id: 3, weight: expect.closeTo(0.7466666666666667) },
      { id: 1, weight: expect.closeTo(0.4) },
      { id: 4, weight: expect.closeTo(0.37333333333333335) },
      { id: 2, weight: expect.closeTo(0.2) },
    ]);
  });

  it('returns an empty result when there are no seeds', async () => {
    const result = await walkSource({
      seeds: [],
      getNeighbours: () => Promise.resolve([]),
    });

    expect(result).toEqual([]);
  });
});
