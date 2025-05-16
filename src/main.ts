import './instrument';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from 'src/env/env.service';
import { RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }], // Exclude the root from the prefix
  });
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  const envsService = app.get(EnvService);
  await app.listen(envsService.get('PORT'));
}

bootstrap();
