import { Injectable } from '@nestjs/common';
import axios, { isAxiosError } from 'axios';
import { JEV_BASE_URL } from '@/common/app.constants';
import { EnvService } from '@/env/env.service';
import { TitleWithDetail } from '@/feed/engine/details/details.types';
import { ScoringService } from '@/feed/engine/scoring/scoring.service';
import {
  ScoringInstructions,
  TitleWithContext,
} from '@/feed/engine/scoring/scoring.types';
import {
  FIT_INSTRUCTIONS,
  FIT_LEVELS,
} from '@/feed/engine/scoring/scoring.constants';
import {
  jevAnswerSchema,
  JevBody,
  JevRequest,
  JevResult,
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

    const scoringInstructions = this.buildScoringInstructions(candidates);
    const candidateIds = new Set(
      scoringInstructions.map(({ id }) => String(id)),
    );

    const data = await this.send({
      model: this.env.get('JEV_MODEL'),
      state: this.buildScoringState(titlesWithContext),
      questions: Object.fromEntries(
        scoringInstructions.map(({ id, instructions, criteria }) => [
          id,
          { type: 'score', instructions, criteria },
        ]),
      ),
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

  private buildScoringState(known: TitleWithContext[]): string {
    return JSON.stringify({ known });
  }

  private buildScoringInstructions(
    candidates: TitleWithDetail[],
  ): ScoringInstructions[] {
    return candidates.map((candidate) => ({
      id: candidate.id,
      mediaType: candidate.mediaType,
      instructions: [
        ...FIT_INSTRUCTIONS,
        `Candidate: ${JSON.stringify(candidate)}`,
      ].join('\n'),
      criteria: FIT_LEVELS,
    }));
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
