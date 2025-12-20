import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  LoggableObject,
  redactSensitiveInfo,
} from './functions/redact-sensitive-info';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url, body } = req;
    const redactedBody = redactSensitiveInfo(body as unknown as LoggableObject);

    // Log incoming request
    this.logger.log({
      message: `Incoming Request`,
      method,
      url,
      body: redactedBody,
    });

    return next.handle().pipe(
      map((responseData: Response) => {
        // Log outgoing response after processing
        const redactedResponse = redactSensitiveInfo(
          responseData as unknown as LoggableObject,
        );
        this.logger.log({
          message: `Outgoing Response`,
          method,
          url,
          duration: Date.now() - now,
          response: redactedResponse,
        });
        return responseData; // return the same data user receives
      }),
    );
  }
}
