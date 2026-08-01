import { Injectable } from '@nestjs/common';
import {
  FeedCandidate,
  FeedCandidateSource,
  FeedContext,
} from '@/feed/types/feed.types';
import { TitleFinderService } from '@/feed/title-finder.service';
import { scoreCandidate } from '@/feed/utils/scoring';
import {
  RankingWeights,
  rankingWeightsFor,
  sourceSharesFor,
} from '@/feed/constants/feed.constant';

/** One source's ranked ids plus its progress through the mixing loop. */
type SourceQueue = {
  share: number;
  ids: number[];
  nextIndex: number;
  taken: number;
};

/** Turns one round of TMDB candidates into a ranked, mixed list of ids. */
@Injectable()
export class BatchBuilderService {
  constructor(private readonly titleFinderService: TitleFinderService) {}

  async build(context: FeedContext): Promise<number[]> {
    const candidates = await this.titleFinderService.find(context);
    const kept = candidates.filter((candidate) =>
      this.isAllowed(candidate, context),
    );
    return this.mixSources(this.rankBySource(kept, context), context);
  }

  // Both discover sources drop avoided genres at fetch time; the similar
  // source can't, so it's caught here.
  private isAllowed(candidate: FeedCandidate, context: FeedContext): boolean {
    return (
      !context.hiddenIds.has(candidate.id) &&
      !context.excludeIds.has(candidate.id) &&
      !candidate.genreIds.some((genreId) =>
        context.avoid.blockedGenreIds.has(genreId),
      )
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
      const score = scoreCandidate(candidate, context, weights);
      const best = bestScoreById.get(candidate.id);
      if (best === undefined || score > best) {
        bestScoreById.set(candidate.id, score);
      }
    }

    return [...bestScoreById.entries()]
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .map(([id]) => id);
  }

  /**
   * Merges the per-source rankings into one list where any stretch keeps
   * roughly the target source shares, so a page always mixes taste discovery,
   * similar titles and popular titles. A title found by several sources counts
   * once. Once a source runs dry the others fill its slots.
   */
  private mixSources(
    rankedBySource: Map<FeedCandidateSource, number[]>,
    context: FeedContext,
  ): number[] {
    const shares = sourceSharesFor(
      context.taste.exploreLevel,
      context.likedTitles.length,
    );

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
        this.howFarBehind(queue, mixed.length) >
        this.howFarBehind(leading, mixed.length)
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

  private howFarBehind(queue: SourceQueue, mixedCount: number): number {
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
