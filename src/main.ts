import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from 'src/env/env.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const envsService = app.get(EnvService);
  await app.listen(envsService.get('PORT'));
}
bootstrap();
