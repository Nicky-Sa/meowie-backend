import { Module } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { TmdbModule } from '../tmdb/tmdb.module';
import { ImagesModule } from '../images/images.module';

@Module({
  imports: [TmdbModule, ImagesModule],
  providers: [PersonService],
  controllers: [PersonController],
})
export class PersonModule {}
