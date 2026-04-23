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
} from '../../utils/redact-sensitive-info';
import { EnvService } from 'src/env/env.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly env: EnvService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url, body } = req;
    const isDev = this.env.get('BUILD_ENV') === 'development';

    const redactedBody = isDev
      ? redactSensitiveInfo(body as unknown as LoggableObject)
      : null;

    // Log incoming request
    this.logger.log({
      message: `Incoming Request`,
      method,
      url,
      ...(redactedBody && { body: redactedBody }),
    });

    return next.handle().pipe(
      map((responseData: Response) => {
        // Log outgoing response after processing
        const redactedResponse = isDev
          ? redactSensitiveInfo(responseData as unknown as LoggableObject)
          : null;
        this.logger.log({
          message: `Outgoing Response`,
          method,
          url,
          duration: Date.now() - now,
          ...(redactedResponse && { response: redactedResponse }),
        });
        return responseData; // return the same data user receives
      }),
    );
  }
}
