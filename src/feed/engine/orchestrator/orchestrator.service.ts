import { Inject, Injectable } from '@nestjs/common';
import { HIGHEST_RATING } from '@/library/constants/library.constants';
import { Title } from '@/feed/engine/engine.types';
import { TitleWithDetail } from '@/feed/engine/details/details.types';
import {
  MIN_FEED_SCORE,
  MIN_RATING_FOR_RECOMMENDATIONS,
} from '@/feed/constants/feed.constant';
import { DetailsService } from '@/feed/engine/details/details.service';
import { FEED_FILTERS } from '@/feed/engine/filter/filter.service';
import { FeedFilter } from '@/feed/engine/filter/filter.types';
import { FEED_INPUTS } from '@/feed/engine/input/input.service';
import { FeedInput, InputResult } from '@/feed/engine/input/input.types';
import {
  OrchestratorRequest,
  OrchestratorResult,
} from '@/feed/engine/orchestrator/orchestrator.types';
import { ScoringService } from '@/feed/engine/scoring/scoring.service';
import { TitleWithContext } from '@/feed/engine/scoring/scoring.types';
import { FEED_SOURCES } from '@/feed/engine/source/source.service';
import { FeedSource, SourceProgress } from '@/feed/engine/source/source.types';
import { RecommendationsRequest } from '@/feed/engine/source/recommendations/recommendations.types';
import { FeedStorageService } from '@/feed/storage/storage.service';

@Injectable()
export class OrchestratorService {
  constructor(
    @Inject(FEED_INPUTS)
    private readonly inputServices: readonly FeedInput[],
    @Inject(FEED_SOURCES)
    private readonly sourceServices: readonly FeedSource[],
    private readonly detailsService: DetailsService,
    @Inject(FEED_FILTERS)
    private readonly filterServices: readonly FeedFilter[],
    private readonly scoringService: ScoringService,
    private readonly storageService: FeedStorageService,
  ) {}

  async run(request: OrchestratorRequest): Promise<OrchestratorResult> {
    const { mediaType } = request;

    const state = await this.storageService.readFeedState(request);

    // stop the run if all sources are exhausted
    if (this.storageService.areAllSourcesExhausted(state.sources)) {
      return {
        scoredTitles: [],
        next: state.sources,
      };
    }

    // step 1: initial titles to build the candidates from
    const inputs = await Promise.all(
      this.inputServices.map((input) => input.read(request)),
    );

    const allInputTitles = this.getAllInputTitles(inputs);

    // step 2: potential candidates from different sources
    const sourceData = await Promise.all(
      this.sourceServices.map(async (source) => {
        const progress = state.sources[source.name];

        if (progress?.status === 'exhausted') {
          return { name: source.name, candidates: [], next: progress };
        }

        switch (source.name) {
          case 'recommendations': {
            const progress = state.sources[source.name];
            const result = await source.fetch({
              inputs: this.getRecommendationInputs(inputs),
              mediaType,
              cursor: progress?.status === 'more' ? progress.cursor : null,
            });

            return { name: source.name, ...result };
          }
          case 'discover': {
            const progress = state.sources[source.name];
            const result = await source.fetch({
              mediaType,
              cursor: progress?.status === 'more' ? progress.cursor : null,
            });

            return { name: source.name, ...result };
          }
        }
      }),
    );

    // step 3: fetching the details for the unique set of candidates + inputs to avoid fetching duplicate titles
    const candidates = this.deduplicateTitles(
      sourceData.map(({ candidates }) => candidates),
    );
    const processedTitleIds = new Set(
      await this.storageService.findProcessedTitleIds(
        request,
        candidates.map(({ id }) => id),
      ),
    );
    const uniqueUnprocessedCandidates = candidates.filter(
      ({ id }) => !processedTitleIds.has(id),
    );
    const uniqueTitlesToFetchDetails = this.deduplicateTitles([
      uniqueUnprocessedCandidates,
      allInputTitles,
    ]);
    const titleDetails = await this.detailsService.fetchBatch(
      uniqueTitlesToFetchDetails,
    );

    // step 4: filtering out invaluable/unwanted candidates
    let filteredCandidates = this.extractCandidates(
      uniqueUnprocessedCandidates,
      titleDetails,
    ); // extracting candidates and leaving inputs out

    for (const filterService of this.filterServices) {
      filteredCandidates = await filterService.filter({
        ...request,
        title: filteredCandidates,
      });
    }

    // step 5: preparing scoring requirements, which would be inputs + context for state and candidates with details for questions
    // and skipping scoring if there is no user data
    const titlesWithContext = this.addContextToTitle(inputs, titleDetails);
    const hasUserData = titlesWithContext.length > 0;
    const scores = hasUserData
      ? await this.scoringService.score({
          candidates: filteredCandidates,
          titlesWithContext,
        })
      : filteredCandidates.map((candidate) => ({ ...candidate, score: null }));

    // step 6: removing low-scored titles
    const scoredTitles = scores.filter(
      ({ score }) => score === null || score >= MIN_FEED_SCORE,
    );
    const next = Object.fromEntries(
      sourceData.map(({ name, next }) => [name, next]),
    ) as SourceProgress;

    await this.storageService.saveFeedState(request, {
      inputId: state.inputId,
      sources: next,
      newProcessedTitleIds: uniqueUnprocessedCandidates.map(({ id }) => id),
      newAcceptedTitleIds: scoredTitles.map(({ id }) => id),
    });

    return { scoredTitles, next };
  }

  private deduplicateTitles(titleLists: Title[][]): Title[] {
    const uniqueTitles = new Map<number, Title>();

    for (const titles of titleLists) {
      for (const title of titles) {
        uniqueTitles.set(title.id, title);
      }
    }

    return [...uniqueTitles.values()];
  }

  private extractCandidates(
    candidates: Title[],
    titleDetails: TitleWithDetail[],
  ): TitleWithDetail[] {
    const candidateIds = new Set(candidates.map(({ id }) => id));

    return titleDetails.filter(({ id }) => candidateIds.has(id));
  }

  private getRecommendationInputs(
    inputs: InputResult[],
  ): RecommendationsRequest['inputs'] {
    const tasteIds = new Set<number>();
    const libraryIds = new Set<number>();
    const dislikedIds: number[] = [];
    const ratings = new Map<number, number>();

    for (const input of inputs) {
      switch (input.type) {
        case 'taste':
          for (const title of input.titles.liked) {
            tasteIds.add(title.id);
          }
          for (const title of input.titles.disliked) {
            dislikedIds.push(title.id);
          }
          break;
        case 'library':
          for (const title of input.titles.saved) {
            libraryIds.add(title.id);
          }
          for (const title of input.titles.seen) {
            if (title.rating !== null) {
              ratings.set(title.id, title.rating);
            }
          }
          break;
      }
    }

    for (const id of dislikedIds) {
      tasteIds.delete(id);
      libraryIds.delete(id);
    }
    for (const [id, rating] of ratings) {
      tasteIds.delete(id);
      if (rating >= MIN_RATING_FOR_RECOMMENDATIONS) {
        libraryIds.add(id);
      } else {
        libraryIds.delete(id);
      }
    }

    for (const id of libraryIds) tasteIds.delete(id);

    const titleIdsByInput = { taste: tasteIds, library: libraryIds };

    return inputs.map((input) => ({
      titleIds: [...titleIdsByInput[input.type]],
      weight: input.weight,
    }));
  }

  private getAllInputTitles(inputs: InputResult[]): Title[] {
    const titles: Title[] = [];

    for (const input of inputs) {
      switch (input.type) {
        case 'taste':
          titles.push(...input.titles.liked, ...input.titles.disliked);
          break;
        case 'library':
          titles.push(...input.titles.saved, ...input.titles.seen);
          break;
      }
    }

    return titles;
  }

  private addContextToTitle(
    inputs: InputResult[],
    titleDetails: TitleWithDetail[],
  ): TitleWithContext[] {
    const detailsByTitle = new Map(
      titleDetails.map((title) => [title.id, title]),
    );
    const titles = new Map<number, TitleWithContext>();
    const addContext = (title: Title, description: string) => {
      let titleForScoring = titles.get(title.id);

      if (!titleForScoring) {
        titleForScoring = {
          id: title.id,
          mediaType: title.mediaType,
          details: detailsByTitle.get(title.id) ?? null,
          context: [],
        };
        titles.set(title.id, titleForScoring);
      }

      titleForScoring.context.push({ description });
    };

    for (const input of inputs) {
      switch (input.type) {
        case 'taste':
          for (const title of input.titles.liked) {
            addContext(title, 'The user liked this title.');
          }
          for (const title of input.titles.disliked) {
            addContext(title, 'The user disliked this title.');
          }
          break;
        case 'library':
          for (const title of input.titles.saved) {
            addContext(title, 'The user saved this title to watch.');
          }
          for (const title of input.titles.seen) {
            addContext(
              title,
              title.rating === null
                ? 'The user has seen this title.'
                : `The user has seen and rated this title ${title.rating} out of ${HIGHEST_RATING}.`,
            );
          }
          break;
      }
    }

    return [...titles.values()];
  }
}
