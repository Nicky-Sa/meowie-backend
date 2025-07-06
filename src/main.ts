import './instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from 'src/env/env.service';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  const envsService = app.get(EnvService);
  await app.listen(envsService.get('PORT'));
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
