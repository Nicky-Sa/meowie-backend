import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response as ExpressResponse } from 'express';

export type SuccessResponse<T> = {
  success: true;
  statusCode: number;
  data: T;
  timestamp: string;
};

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();

    return next.handle().pipe(
      map((data: T) => ({
        success: true,
        statusCode: response.statusCode,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
