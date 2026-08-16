import { Seed } from '@/feed/engine/1-seeds/seed.types';
import {
  MAX_TITLES_TO_FOLLOW,
  WALK_RESTART,
  WALK_ROUNDS,
} from '@/feed/engine/constants/feed.constant';
import { Stage } from '@/feed/engine/stage.type';
import {
  WalkInput,
  WalkOutput,
  WalkedTitle,
  Weights,
} from '@/feed/engine/2-generate/walk.types';

/**
 * Follows recommendation links from the strongest seed titles.
 *
 * Most of each title's weight is spread evenly across its recommendations.
 * The rest is returned to the original seeds so the walk stays anchored to
 * the user's original taste.
 */
const run = async ({
  seeds,
  getNeighbours,
}: WalkInput): Promise<WalkOutput> => {
  const normalizedSeeds = normalizeSeedWeights(seeds);
  const collected: Weights = new Map();
  let scores = normalizedSeeds;

  for (let round = 0; round < WALK_ROUNDS; round++) {
    scores = await spread(scores, normalizedSeeds, getNeighbours);
    addInto(collected, scores);
  }

  return [...collected]
    .map(([id, weight]): WalkedTitle => ({ id, weight }))
    .sort((a, b) => b.weight - a.weight);
};

export const walkStage: Stage<WalkInput, Promise<WalkOutput>> = { run };

/**
 * Normalizes the seed weights so that their absolute values add up to 1.
 *
 * For example, weights of 2, 1, and 1 become 0.5, 0.25, and 0.25. This
 * preserves the relative strength of each seed while making the starting
 * weights independent of the total weight.
 */
const normalizeSeedWeights = (seeds: Seed[]): Weights => {
  const sizes = seeds.map((seed) => [seed.id, Math.abs(seed.weight)] as const);
  const total = sizes.reduce((sum, [, size]) => sum + size, 0);

  if (total === 0) return new Map();

  return new Map(sizes.map(([id, size]) => [id, size / total]));
};

/**
 * Runs one round of the walk.
 *
 * Only the strongest titles are followed. Titles outside the frontier keep
 * their current weight but do not generate another hop. The frontier's weight
 * is spread across its neighbours, while the restart share is added back to
 * the original seeds.
 *
 * For example, with a weight of 0.5, 3 neighbours, and a restart value of
 * 0.2, 0.5 * (1 - 0.2) = 0.4 is spread across the neighbours (0.4 / 3 = 0.1333 each) and 0.5 - 0.4 = 0.1 is returned
 * to the original seed.
 */
const spread = async (
  scores: Weights,
  seedShares: Weights,
  getNeighbours: WalkInput['getNeighbours'],
): Promise<Weights> => {
  const frontier = [...scores] // [id, weight]
    .sort(([, weightA], [, weightB]) => weightB - weightA)
    .slice(0, MAX_TITLES_TO_FOLLOW);

  const frontierIds = new Set(frontier.map(([id]) => id));

  // Titles that weren't followed remain available for later rounds.
  const carriedOver = new Map(
    [...scores].filter(([id]) => !frontierIds.has(id)),
  );

  const next = carriedOver;

  const neighbourLists = await Promise.all(
    frontier.map(([id]) => getNeighbours(id)),
  );

  frontier.forEach(([, weight], index) => {
    const neighbours = neighbourLists[index];

    if (neighbours.length === 0) return;

    const share = (weight * (1 - WALK_RESTART)) / neighbours.length;

    for (const neighbour of neighbours) {
      // next = non-frontier titles that survived + recommendations produced by the frontier
      next.set(neighbour, (next.get(neighbour) ?? 0) + share);
    }
  });

  for (const [id, weight] of seedShares) {
    next.set(id, (next.get(id) ?? 0) + WALK_RESTART * weight);
  }

  return next;
};

/**
 * Adds the current round's weights to the accumulated result.
 *
 * A title can therefore become stronger by appearing in several rounds or
 * being reached through several different recommendation paths.
 */
const addInto = (collected: Weights, scores: Weights): void => {
  for (const [id, weight] of scores) {
    collected.set(id, (collected.get(id) ?? 0) + weight);
  }
};
