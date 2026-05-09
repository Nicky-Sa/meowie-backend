import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
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

    // If it's not an HTTP context, we can't do much with the response
    if (!response || typeof response.status !== 'function') {
      return;
    }

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
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
    if (status >= 500) {
      Sentry.captureException(exception);
    }

    const errorResponse: ErrorResponse = {
      success: false,
      errors: Array.isArray(errorMessage)
        ? errorMessage.join(', ')
        : errorMessage,
      statusCode: status,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.error(errorResponse);
    } catch (e) {
      console.error('Logger failed in GlobalExceptionFilter:', e);
    }

    response.status(status).json(errorResponse);
  }
}
