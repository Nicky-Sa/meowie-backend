import { Inject, Injectable } from '@nestjs/common';
import { HIGHEST_RATING } from '@/library/constants/library.constants';
import { Title } from '@/feed/engine/engine.types';
import { TitleWithDetail } from '@/feed/engine/details/details.types';
import { MIN_RATING_FOR_RECOMMENDATIONS } from '@/feed/constants/feed.constant';
import { DetailsService } from '@/feed/engine/details/details.service';
import { MediaType } from '@/types/media-type';
import { FEED_FILTERS } from '@/feed/engine/filter/filter.service';
import { FeedFilter } from '@/feed/engine/filter/filter.types';
import { FEED_INPUTS } from '@/feed/engine/input/input.service';
import { FeedInput, InputResult } from '@/feed/engine/input/input.types';
import {
  OrchestratorRequest,
  OrchestratorResult,
  SourceData,
} from '@/feed/engine/orchestrator/orchestrator.types';
import { ScoringService } from '@/feed/engine/scoring/scoring.service';
import { TitleWithContext } from '@/feed/engine/scoring/scoring.types';
import { sortScoredCandidates } from '@/feed/engine/scoring/scoring.utils';
import { FEED_SOURCES } from '@/feed/engine/source/source.service';
import { FeedSource } from '@/feed/engine/source/source.types';

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
  ) {}

  async run({
    userId,
    mediaType,
    cursors,
  }: OrchestratorRequest): Promise<OrchestratorResult> {
    // step 1: initial titles to build the candidates from
    const inputs = await Promise.all(
      this.inputServices.map((input) => input.read({ userId, mediaType })),
    );

    const allInputTitles = this.getAllInputTitles(inputs, mediaType);

    // step 2: potential candidates from different sources
    const sourceData: Partial<SourceData> = {};

    await Promise.all(
      this.sourceServices.map(async (source) => {
        switch (source.name) {
          case 'recommendations':
            sourceData.recommendations = await source.fetch({
              titleIds: this.getTitleIdsToRecommendFrom(inputs, mediaType),
              mediaType,
              cursor: cursors.recommendations,
            });
            break;
          case 'discover':
            sourceData.discover = await source.fetch({
              mediaType,
              cursor: cursors.discover,
            });
            break;
        }
      }),
    );

    if (!sourceData.recommendations || !sourceData.discover) {
      throw new Error(
        'Recommendations and Discover sources must be registered.',
      );
    }

    // step 3: fetching the details for the unique set of candidates + inputs to avoid fetching duplicate titles
    const uniqueCandidates = this.deduplicateTitles([
      sourceData.recommendations.candidates,
      sourceData.discover.candidates,
    ]);
    const uniqueTitlesToFetchDetails = this.deduplicateTitles([
      uniqueCandidates,
      allInputTitles,
    ]);
    const titleDetails = await this.detailsService.fetchBatch(
      uniqueTitlesToFetchDetails,
    );

    // step 4: filtering out invaluable/unwanted candidates
    let filteredCandidates = this.extractCandidates(
      uniqueCandidates,
      titleDetails,
    ); // extracting candidates and leaving inputs out

    for (const filterService of this.filterServices) {
      filteredCandidates = await filterService.filter({
        userId,
        title: filteredCandidates,
      });
    }

    // step 5: preparing scoring requirements, which would be inputs + context for state and candidates with details for questions
    const titlesWithContext = this.addContextToTitle(
      inputs,
      mediaType,
      titleDetails,
    );
    const scores = await this.scoringService.score({
      titlesWithContext,
      candidates: filteredCandidates,
    });

    return {
      candidates: sortScoredCandidates({
        candidates: filteredCandidates,
        scores,
      }),
      next: {
        recommendations: sourceData.recommendations.next,
        discover: sourceData.discover.next,
      },
    };
  }

  private deduplicateTitles(titleLists: Title[][]): Title[] {
    const uniqueTitles = new Map<string, Title>();

    for (const titles of titleLists) {
      for (const title of titles) {
        uniqueTitles.set(`${title.mediaType}:${title.id}`, title);
      }
    }

    return [...uniqueTitles.values()];
  }

  private extractCandidates(
    candidates: Title[],
    titleDetails: TitleWithDetail[],
  ): TitleWithDetail[] {
    const candidateIds = new Set(
      candidates.map(({ id, mediaType }) => `${mediaType}:${id}`),
    );

    return titleDetails.filter(({ id, mediaType }) =>
      candidateIds.has(`${mediaType}:${id}`),
    );
  }

  private getTitleIdsToRecommendFrom(
    inputs: InputResult[],
    mediaType: MediaType,
  ): number[] {
    const resultIds = new Set<number>(); // final output
    const dislikedIds: number[] = [];
    const ratings = new Map<number, number>();

    for (const input of inputs) {
      switch (input.type) {
        case 'taste':
          for (const title of input.titles.liked) {
            if (title.mediaType === mediaType) resultIds.add(title.id);
          }
          for (const title of input.titles.disliked) {
            if (title.mediaType === mediaType) dislikedIds.push(title.id);
          }
          break;
        case 'library':
          for (const title of input.titles.saved) {
            if (title.mediaType === mediaType) resultIds.add(title.id);
          }
          for (const title of input.titles.seen) {
            if (title.mediaType === mediaType && title.rating !== null) {
              ratings.set(title.id, title.rating);
            }
          }
          break;
      }
    }

    for (const id of dislikedIds) resultIds.delete(id);
    for (const [id, rating] of ratings) {
      if (rating >= MIN_RATING_FOR_RECOMMENDATIONS) {
        resultIds.add(id);
      } else {
        resultIds.delete(id);
      }
    }

    return [...resultIds].sort((a, b) => a - b);
  }

  private getAllInputTitles(
    inputs: InputResult[],
    mediaType: MediaType,
  ): Title[] {
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

    return titles.filter((title) => title.mediaType === mediaType);
  }

  private addContextToTitle(
    inputs: InputResult[],
    mediaType: MediaType,
    titleDetails: TitleWithDetail[],
  ): TitleWithContext[] {
    const detailsByTitle = new Map(
      titleDetails.map((title) => [`${title.mediaType}:${title.id}`, title]),
    );
    const titles = new Map<string, TitleWithContext>();
    const addContext = (title: Title, description: string) => {
      if (title.mediaType !== mediaType) return;

      const titleId = `${title.mediaType}:${title.id}`;
      let titleForScoring = titles.get(titleId);

      if (!titleForScoring) {
        titleForScoring = {
          id: title.id,
          mediaType: title.mediaType,
          details: detailsByTitle.get(titleId) ?? null,
          context: [],
        };
        titles.set(titleId, titleForScoring);
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
