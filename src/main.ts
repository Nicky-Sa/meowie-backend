import './instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from 'src/env/env.service';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './utils/response.interceptor';
import { GlobalExceptionFilter } from './utils/global-exception.filter';
import { LoggingInterceptor } from './utils/logging.interceptor';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new SentryGlobalFilter());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  const env = app.get(EnvService);
  await app.listen(env.get('PORT'));
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
