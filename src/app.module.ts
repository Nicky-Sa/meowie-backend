import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs/setup';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { AppController } from '@/app.controller';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { BullModule } from '@nestjs/bullmq';
import Redis from 'ioredis';
import { MovieModule } from '@/movie/movie.module';
import { EnvModule } from '@/env/env.module';
import { EnvService } from '@/env/env.service';
import { AuthModule } from '@/auth/auth.module';
import { UserModule } from '@/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@/cache/cache.module';
import { Duration } from '@/common/app.constants';
import { OtpModule } from '@/otp/otp.module';
import { EmailModule } from '@/email/email.module';
import { getDataSourceOptions } from '@/database/database.config';
import { ConstantsModule } from '@/constants/constants.module';
import { PersonModule } from '@/person/person.module';
import { SearchModule } from '@/search/search.module';
import { LibraryModule } from '@/library/library.module';
import { SeriesModule } from '@/series/series.module';
import { RatingsModule } from '@/ratings/ratings.module';
import { ImagesModule } from '@/images/images.module';
import { CollectionsModule } from '@/collections/collections.module';
import { AiModule } from '@/ai/ai.module';
import { HealthModule } from '@/health/health.module';
import { LifecycleService } from '@/common/lifecycle.service';
import { ClsModule } from '@/common/cls/cls.module';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { ClsMiddleware } from '@/common/cls/cls.middleware';

@Module({
  imports: [
    SentryModule.forRoot(),
    BullModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (env: EnvService) => ({
        connection: {
          url: env.get('REDIS_ENDPOINT'),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 300,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (env: EnvService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: Duration.ONE_SECOND * 1000,
            limit: 30,
          },
          {
            name: 'medium',
            ttl: Duration.TEN_SECONDS * 1000,
            limit: 20,
          },
          {
            name: 'long',
            ttl: Duration.ONE_MINUTE * 1000,
            limit: 100,
          },
        ],
        storage: new ThrottlerStorageRedisService(
          new Redis(env.get('REDIS_ENDPOINT')),
        ),
      }),
    }),
    MovieModule,
    EnvModule,
    AuthModule,
    UserModule,
    TypeOrmModule.forRoot({
      ...getDataSourceOptions('app'),
      // helpful in NestJS to avoid manually importing entities in the config
      autoLoadEntities: true,
    }),
    OtpModule,
    CacheModule,
    EmailModule,
    ConstantsModule,
    PersonModule,
    SearchModule,
    LibraryModule,
    SeriesModule,
    RatingsModule,
    ImagesModule,
    CollectionsModule,
    AiModule,
    HealthModule,
    ClsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    LifecycleService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClsMiddleware).forRoutes('*');
  }
}
