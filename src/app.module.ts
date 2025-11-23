import { Module } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';
import { EnvModule } from './env/env.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from './cache/cache.module';
import { OtpModule } from './otp/otp.module';
import { EmailModule } from './email/email.module';
import { getDataSourceOptions } from './database/database.config';

@Module({
  imports: [
    SentryModule.forRoot(),
    MoviesModule,
    EnvModule,
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot({
      ...getDataSourceOptions('app'),
      // helpful in NestJS to avoid manually importing entities in the config
      autoLoadEntities: true,
    }),
    OtpModule,
    CacheModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
