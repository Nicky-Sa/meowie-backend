import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ServiceUnavailableException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { isAxiosError } from 'axios';

type TmdbErrorResponse = {
  status_message?: string;
  status_code?: number;
  errors?: string[]; // Sometimes TMDB sends an array of strings
};

@Injectable()
export class TMDBErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TMDBErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (isAxiosError(error) && error.response) {
          const status = error.response.status;
          const data = error.response.data as TmdbErrorResponse;

          // Combine possible error messages
          const tmdbMessage =
            data?.status_message ||
            (data?.errors ? data.errors.join(', ') : null) ||
            error.message;

          const logMessage = `TMDB Error [${status}]": ${tmdbMessage}`;
          console.log({ error, status });

          // 1. Handle 404 (Not Found)
          if (status === 404) {
            return throwError(
              () => new NotFoundException(`Resource not found. ${tmdbMessage}`),
            );
          }

          // 2. Handle 401 (Bad API Key)
          if (status === 401) {
            this.logger.error(`CRITICAL: TMDB API Key invalid. ${tmdbMessage}`);
            return throwError(
              () =>
                new UnauthorizedException(
                  'External movie service unauthorized (Check API Key)',
                ),
            );
          }

          // 3. Handle 422 (Validation Error - e.g. invalid date or page number)
          if (status === 422) {
            this.logger.warn(logMessage);
            return throwError(
              () =>
                new BadRequestException(
                  `Invalid query params sent to TMDB: ${tmdbMessage}`,
                ),
            );
          }

          // 4. Handle 429 (Rate Limit)
          if (status === 429) {
            this.logger.warn(`TMDB Rate Limit Hit: ${logMessage}`);
            return throwError(
              () =>
                new ServiceUnavailableException(
                  'Movie service is busy, please try again later',
                ),
            );
          }

          // Log other weird errors (500s from TMDB)
          this.logger.error(logMessage);
        } else {
          // Network errors (no response received)
          this.logger.error(`Network Error calling TMDB: ${error}`);
        }

        // Default fallback for everything else
        return throwError(
          () =>
            new InternalServerErrorException(
              `Unknown error happened while calling TMDB: ${error}`,
            ),
        );
      }),
    );
  }
}
