import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ClsService } from './cls.service';
import { EnvService } from 'src/env/env.service';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class ClsLogger extends ConsoleLogger {
  private readonly winstonLogger: winston.Logger;

  constructor(
    private readonly cls: ClsService,
    private readonly env: EnvService,
  ) {
    super();

    const isProduction = this.env.get('BUILD_ENV') === 'production';

    // Create a Winston logger that writes to a daily rotating file
    this.winstonLogger = winston.createLogger({
      level: isProduction ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          dirname: 'logs',
          filename: 'application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
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
    if (this.env.get('BUILD_ENV') === 'production') return;
    this.print('debug', message, context);
  }

  verbose(message: unknown, context?: string): void {
    if (this.env.get('BUILD_ENV') === 'production') return;
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

    // Log to standard NestJS ConsoleLogger
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

    // Log to Winston
    const winstonLevel = level === 'log' ? 'info' : level;

    // Create an object for Winston to log as JSON
    const logData: Record<string, unknown> = {
      context: ctx,
      ...(stack ? { stack } : {}),
      ...(id ? { correlationId: id } : {}),
    };

    if (typeof finalMessage === 'string') {
      logData.message = finalMessage;
    } else if (typeof finalMessage === 'object' && finalMessage !== null) {
      Object.assign(logData, finalMessage);
    } else {
      logData.message = String(finalMessage);
    }

    this.winstonLogger.log(winstonLevel, logData);
  }
}
