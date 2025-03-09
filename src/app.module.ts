import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';
import { ConfigModule } from '@nestjs/config';
import { EnvModule } from './env/env.module';
import { envSchema } from './env/env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.local',
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    MoviesModule,
    EnvModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
