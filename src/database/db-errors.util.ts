import { QueryFailedError } from 'typeorm';

export type PostgresQueryFailedError = QueryFailedError & {
  code: string;
};

export function isQueryFailedError(
  error: unknown,
): error is PostgresQueryFailedError {
  return error instanceof QueryFailedError && 'code' in error;
}

export function isUniqueConstraintViolation(
  error: unknown,
): error is PostgresQueryFailedError {
  return isQueryFailedError(error) && error.code === '23505';
}
