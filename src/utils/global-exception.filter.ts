import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { isArray } from 'lodash';
import * as Sentry from '@sentry/nestjs';

type ErrorResponse = {
  success: false;
  statusCode: number;
  errors: string;
  timestamp: string;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const res = exception.getResponse();
      errorMessage =
        typeof res === 'string'
          ? res
          : (res as { message: string | string[] }).message ||
            'An unexpected error occurred';
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
    }

    // Conditionally capture only 5xx errors
    if (status.valueOf() >= 500) {
      Sentry.captureException(exception);
    }

    const errorResponse: ErrorResponse = {
      success: false,
      errors: isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
      statusCode: status,
      timestamp: new Date().toISOString(),
    };

    this.logger.error(errorResponse);

    response.status(status).json(errorResponse);
  }
}
