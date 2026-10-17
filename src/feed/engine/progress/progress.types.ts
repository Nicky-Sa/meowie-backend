import { z } from 'zod';

export type ProgressRequest<TRequest, TResult> = {
  cursor: readonly TRequest[] | null; // an array of next requests
  firstPageRequests: readonly TRequest[]; // used for the first request when cursor is `null`
  pageRequestSchema: z.ZodType<TRequest>; // defines what a valid saved request looks like. ProgressService uses it to check data read from the cursor.
  fetchPage: (request: TRequest) => Promise<PageFetchResult<TRequest, TResult>>;
};

export type PageFetchResult<TRequest, TResult> = {
  results: TResult[];
  nextRequest: TRequest | null; // null means there is no more page left
};

export type ProgressResult<TRequest, TResult> = {
  results: TResult[];
  next:
    // per caller's status
    { status: 'more'; cursor: readonly TRequest[] } | { status: 'exhausted' };
};
