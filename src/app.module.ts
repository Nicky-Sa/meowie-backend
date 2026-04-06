import { Module } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs/setup';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MovieModule } from './movie/movie.module';
import { EnvModule } from './env/env.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from './cache/cache.module';
import { OtpModule } from './otp/otp.module';
import { EmailModule } from './email/email.module';
import { getDataSourceOptions } from './database/database.config';
import { ConstantsModule } from './constants/constants.module';
import { PersonModule } from './person/person.module';
import { SearchModule } from './search/search.module';
import { LibraryModule } from './library/library.module';
import { SeriesModule } from './series/series.module';
import { RatingsModule } from './ratings/ratings.module';
import { ImagesModule } from './images/images.module';
import { CollectionsModule } from './collections/collections.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    MovieModule,
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
    ConstantsModule,
    PersonModule,
    ConstantsModule,
    PersonModule,
    SearchModule,
    LibraryModule,
    SeriesModule,
    RatingsModule,
    ImagesModule,
    CollectionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
