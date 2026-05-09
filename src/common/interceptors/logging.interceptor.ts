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
} from '@/utils/redact-sensitive-info';
import { EnvService } from '@/env/env.service';
import { ClsService } from '@/common/cls/cls.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(
    private readonly env: EnvService,
    private readonly clsService: ClsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url, body } = req;
    const isDev = this.env.get('BUILD_ENV') === 'development';

    const redactedBody = isDev
      ? redactSensitiveInfo(body as unknown as LoggableObject)
      : null;

    const correlationId = this.clsService.correlationId;

    // Log incoming request
    this.logger.debug({
      message: `Incoming Request`,
      correlationId,
      method,
      url,
      ...(redactedBody && { body: redactedBody }),
    });

    return next.handle().pipe(
      map((responseData: unknown) => {
        // Log outgoing response after processing
        const redactedResponse = isDev
          ? redactSensitiveInfo(responseData as LoggableObject)
          : null;
        this.logger.debug({
          message: `Outgoing Response`,
          correlationId,
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
