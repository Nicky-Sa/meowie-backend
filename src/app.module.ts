import { Module } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';
import { EnvModule } from './env/env.module';
import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { LoggerModule } from 'nestjs-pino';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'node:fs';
import { EnvService } from './env/env.service';
import { CacheModule } from './cache/cache.module';
import { OtpModule } from './otp/otp.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    MoviesModule,
    EnvModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'SYS:standard',
            colorize: true,
            ignore: 'pid',
          },
        },
      },
    }),
    AuthModule,
    UsersModule,
    TypeOrmModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (env: EnvService) => {
        return {
          type: 'postgres',
          host: env.get('DB_HOST'),
          port: env.get('DB_PORT'),
          username: env.get('DB_USER'),
          password: env.get('DB_PASSWORD'),
          database: env.get('DB_NAME'),
          schema: 'meowie',
          migrationsTableName: 'meowie_migrations',
          autoLoadEntities: true,
          ssl: {
            ca: fs.readFileSync(env.get('DB_SSL_CA'), 'utf8').toString(),
            rejectUnauthorized: true,
            servername: env.get('DB_ENDPOINT'),
          },
        };
      },
    }),
    OtpModule,
    CacheModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    AppService,
  ],
})
export class AppModule {}
