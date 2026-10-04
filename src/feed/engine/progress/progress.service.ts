import { Injectable } from '@nestjs/common';
import {
  ProgressRequest,
  ProgressResult,
} from '@/feed/engine/progress/progress.types';

@Injectable()
export class ProgressService {
  async fetch<TRequest, TResult>({
    cursor,
    firstPageRequests,
    pageRequestSchema,
    fetchPage,
  }: ProgressRequest<TRequest, TResult>): Promise<
    ProgressResult<TRequest, TResult>
  > {
    const remainingRequests =
      cursor === null
        ? [...firstPageRequests] // ... to detach the reference
        : pageRequestSchema.array().parse(cursor); // validates the saved requests
    const current = remainingRequests.shift();

    if (current === undefined) {
      return { results: [], next: { status: 'exhausted' } };
    }

    const { results, nextRequest } = await fetchPage(current);

    if (nextRequest !== null) remainingRequests.push(nextRequest);

    return {
      results,
      next:
        remainingRequests.length > 0
          ? { status: 'more', cursor: remainingRequests }
          : { status: 'exhausted' },
    };
  }
}
