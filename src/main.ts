import '@/instrument';
import compression from 'compression';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { EnvService } from '@/env/env.service';
import { Logger, VersioningType } from '@nestjs/common';
import { ClsLogger } from '@/common/cls/cls-logger.service';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import pkg from '../package.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const clsLogger = app.get(ClsLogger);
  app.useLogger(clsLogger);

  const logger = new Logger('Main');

  // Gzip/deflate compression — skip responses under 1KB where overhead isn't worth it
  app.use(compression({ threshold: 1024 }));
  const env = app.get(EnvService);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Setup Swagger
  if (env.get('BUILD_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle(`Meowie API - ${env.get('BUILD_ENV')}`)
      .setVersion(pkg.version)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Access Token here.',
        },
        'jwt-access-docs', // This name here is important for matching in the controller
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Refresh Token here.',
        },
        'jwt-refresh-docs',
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  // --- CORS Configuration ---
  const buildEnv = env.get('BUILD_ENV');
  const allowedDomain = env.get('ALLOWED_DOMAIN');
  const escapedDomain = allowedDomain.replace(/\./g, '\\.');
  const domainRegex = new RegExp(`^https?://(([^/]+\\.)?${escapedDomain})$`);

  app.enableCors({
    origin: buildEnv === 'development' ? '*' : domainRegex,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.enableShutdownHooks();

  await app.listen(env.get('PORT'));
  logger.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
