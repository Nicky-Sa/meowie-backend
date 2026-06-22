import { Inject, Injectable } from '@nestjs/common';
import { FeedContext, FeedCandidate } from '@/feed/engine/engine.types';
import { BaseFilter } from '@/feed/engine/filters/base.filter';
import { BaseScorer } from '@/feed/engine/scorers/base.scorer';
import { CandidateGenerator } from '@/feed/engine/candidate-generator';
import { RANKING_WEIGHTS_BY_FLEXIBILITY } from '@/feed/feed.constants';

export const FEED_FILTERS = 'FEED_FILTERS';
export const FEED_SCORERS = 'FEED_SCORERS';

type ScoredCandidate = { id: number; score: number };

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
    const scored = this.scoreAll(kept, context);
    return this.rank(scored);
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

  /** Scores each candidate with the weighted scorers. */
  private scoreAll(
    candidates: FeedCandidate[],
    context: FeedContext,
  ): ScoredCandidate[] {
    return candidates.map((candidate) => ({
      id: candidate.id,
      score: this.score(candidate, context),
    }));
  }

  /**
   * Deduplicates each title to its highest-scoring instance — it can surface from
   * more than one source (e.g. discovery and a library recommendation), and the
   * source that earns it the better score wins — then returns ids best first.
   */
  private rank(scored: ScoredCandidate[]): number[] {
    return this.deduplicateByMaxScore(scored)
      .sort((a, b) => b.score - a.score)
      .map((candidate) => candidate.id);
  }

  private score(candidate: FeedCandidate, context: FeedContext): number {
    const weights =
      RANKING_WEIGHTS_BY_FLEXIBILITY[context.flexibility] ??
      RANKING_WEIGHTS_BY_FLEXIBILITY.normal;

    return this.scorers.reduce(
      (total, scorer) =>
        total + scorer.score(candidate, context) * weights[scorer.key],
      0,
    );
  }

  private deduplicateByMaxScore(scored: ScoredCandidate[]): ScoredCandidate[] {
    const byId = new Map<number, number>();
    for (const { id, score } of scored) {
      const existing = byId.get(id);
      if (existing === undefined || score > existing) {
        byId.set(id, score);
      }
    }
    return [...byId.entries()].map(([id, score]) => ({ id, score }));
  }
}
