import { Injectable } from '@nestjs/common';
import axios, { isAxiosError } from 'axios';
import { JEV_BASE_URL } from '@/common/app.constants';
import { EnvService } from '@/env/env.service';
import { TitleWithDetail } from '@/feed/engine/details/details.types';
import { ScoringService } from '@/feed/engine/scoring/scoring.service';
import { TitleWithContext } from '@/feed/engine/scoring/scoring.types';
import {
  FIT_RULES,
  FIT_LEVELS,
  FIT_QUESTION,
} from '@/feed/engine/scoring/scoring.constants';
import {
  jevAnswerSchema,
  JevBody,
  JevRequest,
  JevResult,
  JevState,
  JevTitleDetails,
} from '@/feed/engine/scoring/jev/jev.types';

@Injectable()
export class JevScoringService extends ScoringService {
  constructor(private readonly env: EnvService) {
    super();
  }

  async score({
    candidates,
    titlesWithContext,
  }: JevRequest): Promise<JevResult> {
    if (candidates.length === 0) return [];

    const questions = this.buildScoringQuestions(candidates);
    const candidateIds = new Set(Object.keys(questions));

    const data = await this.send({
      model: this.env.get('JEV_MODEL'),
      state: this.buildScoringState(titlesWithContext),
      questions,
    });
    const result = jevAnswerSchema.safeParse(data);

    if (!result.success) {
      throw new Error('Jev returned an invalid score response.');
    }

    const { answers } = result.data;
    const answerIds = Object.keys(answers);

    if (
      answerIds.length !== candidateIds.size ||
      answerIds.some((id) => !candidateIds.has(id))
    ) {
      throw new Error('Jev must return exactly one score for each candidate.');
    }

    return candidates.map((candidate) => ({
      ...candidate,
      score: answers[candidate.id].score,
    }));
  }

  private buildScoringState(known: TitleWithContext[]): JevState {
    return {
      rules: FIT_RULES,
      known: known.map(({ id, mediaType, details, context }) => ({
        id,
        mediaType,
        details: details ? this.buildTitleDetails(details) : null,
        context: context.map(({ description }) => description),
      })),
    };
  }

  private buildScoringQuestions(
    candidates: TitleWithDetail[],
  ): JevBody['questions'] {
    return Object.fromEntries(
      candidates.map((candidate) => [
        candidate.id,
        {
          type: 'score',
          instructions: {
            question: FIT_QUESTION,
            candidate: this.buildTitleDetails(candidate),
          },
          criteria: FIT_LEVELS,
        },
      ]),
    );
  }

  private buildTitleDetails({
    title,
    year,
    overview,
    genres,
    keywords,
  }: TitleWithDetail): JevTitleDetails {
    return {
      title,
      year,
      overview,
      genres: genres.map(({ name }) => name),
      keywords: keywords.map(({ name }) => name),
    };
  }

  private async send(body: JevBody): Promise<unknown> {
    try {
      const response = await axios.post<unknown>(
        `${JEV_BASE_URL}/v1/systemone`,
        body,
        {
          headers: {
            Authorization: `Bearer ${this.env.get('JEV_API_KEY')}`,
          },
          timeout: this.env.get('JEV_TIMEOUT_MS'),
          maxRedirects: 0,
        },
      );

      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
          throw new Error('Jev request timed out.', { cause: error });
        }
        if (error.response) {
          throw new Error(
            `Jev request failed with status ${error.response.status}: ${JSON.stringify(error.response.data)}`,
            { cause: error },
          );
        }
      }

      throw new Error('Jev request failed.', { cause: error });
    }
  }
}
