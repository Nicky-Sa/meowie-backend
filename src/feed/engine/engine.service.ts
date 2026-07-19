import { Inject, Injectable } from '@nestjs/common';
import {
  FeedContext,
  FeedCandidate,
  FeedCandidateSource,
} from '@/feed/engine/engine.types';
import { BaseFilter } from '@/feed/engine/filters/base.filter';
import { BaseScorer } from '@/feed/engine/scorers/base.scorer';
import { CandidateGenerator } from '@/feed/engine/candidate-generator';
import { positiveLibraryItemsFor } from '@/feed/profile/profile.types';
import {
  RankingWeights,
  rankingWeightsFor,
  sourceSharesFor,
} from '@/feed/feed.constants';

export const FEED_FILTERS = 'FEED_FILTERS';
export const FEED_SCORERS = 'FEED_SCORERS';

/** One source's ranked ids plus its progress through the mixing loop. */
type SourceQueue = {
  share: number;
  ids: number[];
  nextIndex: number;
  taken: number;
};

@Injectable()
export class EngineService {
  constructor(
    private readonly candidateGenerator: CandidateGenerator,
    @Inject(FEED_FILTERS) private readonly filters: BaseFilter[],
    @Inject(FEED_SCORERS) private readonly scorers: BaseScorer[],
  ) {}

  async buildBatch(context: FeedContext): Promise<number[]> {
    const candidates = await this.candidateGenerator.generate(context);
    const kept = this.applyFilters(candidates, context);
    const rankedBySource = this.rankBySource(kept, context);
    return this.mixSources(rankedBySource, context);
  }

  /** Keeps only candidates that pass every filter */
  private applyFilters(
    candidates: FeedCandidate[],
    context: FeedContext,
  ): FeedCandidate[] {
    return candidates.filter((candidate) =>
      this.filters.every((filter) => filter.filter(candidate, context)),
    );
  }

  /**
   * Scores and sorts each source's candidates on their own — sources compete
   * for feed slots through their shares, never through raw scores.
   */
  private rankBySource(
    candidates: FeedCandidate[],
    context: FeedContext,
  ): Map<FeedCandidateSource, number[]> {
    const weights = rankingWeightsFor(context.taste.exploreLevel);

    const groups = new Map<FeedCandidateSource, FeedCandidate[]>();
    for (const candidate of candidates) {
      const group = groups.get(candidate.source) ?? [];
      group.push(candidate);
      groups.set(candidate.source, group);
    }

    const ranked = new Map<FeedCandidateSource, number[]>();
    for (const [source, group] of groups) {
      ranked.set(source, this.rank(group, context, weights));
    }
    return ranked;
  }

  /**
   * A title can arrive twice within a source (e.g. two overlapping discover
   * queries); only its highest score is kept. Returns ids best first.
   */
  private rank(
    candidates: FeedCandidate[],
    context: FeedContext,
    weights: RankingWeights,
  ): number[] {
    const bestScoreById = new Map<number, number>();
    for (const candidate of candidates) {
      const score = this.score(candidate, context, weights);
      const best = bestScoreById.get(candidate.id);
      if (best === undefined || score > best) {
        bestScoreById.set(candidate.id, score);
      }
    }

    return [...bestScoreById.entries()]
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .map(([id]) => id);
  }

  private score(
    candidate: FeedCandidate,
    context: FeedContext,
    weights: RankingWeights,
  ): number {
    return this.scorers.reduce(
      (total, scorer) =>
        total + scorer.score(candidate, context) * weights[scorer.key],
      0,
    );
  }

  /**
   * Merges the per-source rankings into one list where any stretch keeps
   * roughly the target source shares — a page always mixes taste discovery,
   * library lookalikes and popular titles instead of one source taking every
   * slot. A title found by several sources counts once, for whichever source
   * reaches it first. Once a source runs dry the others fill its slots.
   */
  private mixSources(
    rankedBySource: Map<FeedCandidateSource, number[]>,
    context: FeedContext,
  ): number[] {
    const librarySize = positiveLibraryItemsFor(
      context.profile,
      context.mediaType,
    ).length;
    const shares = sourceSharesFor(context.taste.exploreLevel, librarySize);

    const queues: SourceQueue[] = [...rankedBySource.entries()].map(
      ([source, ids]) => ({
        share: shares[source],
        ids,
        nextIndex: 0,
        taken: 0,
      }),
    );

    const mixed: number[] = [];
    const used = new Set<number>();
    const hasMore = (queue: SourceQueue) => queue.nextIndex < queue.ids.length;

    while (queues.some(hasMore)) {
      const openQueues = queues.filter(hasMore);

      // The next slot goes to the source lagging furthest behind its share.
      const nextQueue = openQueues.reduce((leading, queue) =>
        this.shareDeficit(queue, mixed.length) >
        this.shareDeficit(leading, mixed.length)
          ? queue
          : leading,
      );

      const id = this.takeNextUnusedId(nextQueue, used);
      if (id === null) continue;

      mixed.push(id);
      used.add(id);
      nextQueue.taken += 1;
    }

    return mixed;
  }

  private shareDeficit(queue: SourceQueue, mixedCount: number): number {
    return queue.share * (mixedCount + 1) - queue.taken;
  }

  /** Moves the queue past ids other sources already placed; null = ran dry. */
  private takeNextUnusedId(
    queue: SourceQueue,
    used: Set<number>,
  ): number | null {
    while (queue.nextIndex < queue.ids.length) {
      const id = queue.ids[queue.nextIndex];
      queue.nextIndex += 1;
      if (!used.has(id)) return id;
    }
    return null;
  }
}
