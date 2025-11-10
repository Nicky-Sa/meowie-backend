import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { isArray } from 'lodash';
import { SentryExceptionCaptured } from '@sentry/nestjs';

type ErrorResponse = {
  success: false;
  statusCode: number;
  errors: string[];
  timestamp: string;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  @SentryExceptionCaptured()
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

    const errorResponse: ErrorResponse = {
      success: false,
      errors: [isArray(errorMessage) ? errorMessage.join(', ') : errorMessage],
      statusCode: status,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
