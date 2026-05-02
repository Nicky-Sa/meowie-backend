import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ClsService } from './cls.service';

@Injectable()
export class ClsLogger extends ConsoleLogger {
  constructor(private readonly cls: ClsService) {
    super();
  }

  log(message: unknown, context?: string): void {
    this.print('log', message, context);
  }

  error(message: unknown, stack?: string, context?: string): void {
    this.print('error', message, context, stack);
  }

  warn(message: unknown, context?: string): void {
    this.print('warn', message, context);
  }

  debug(message: unknown, context?: string): void {
    this.print('debug', message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.print('verbose', message, context);
  }

  private print(
    level: 'log' | 'error' | 'warn' | 'debug' | 'verbose',
    message: unknown,
    context?: string,
    stack?: string,
  ): void {
    const id = this.cls.correlationId;
    let finalMessage = message;

    if (typeof message === 'object' && message !== null) {
      finalMessage = { correlationId: id, ...message };
    } else if (id) {
      finalMessage = `[${id}] ${String(message)}`;
    }

    const ctx = context || this.context;

    switch (level) {
      case 'log':
        super.log(finalMessage, ctx);
        break;
      case 'error':
        super.error(finalMessage, stack, ctx);
        break;
      case 'warn':
        super.warn(finalMessage, ctx);
        break;
      case 'debug':
        super.debug(finalMessage, ctx);
        break;
      case 'verbose':
        super.verbose(finalMessage, ctx);
        break;
    }
  }
}
