import {
  Controller,
  Get,
  Header,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { PersonService } from '@/person/person.service';
import { PersonResDto } from '@/person/dto/person.dto';
import { TMDBErrorInterceptor } from '@/common/interceptors/tmdb-error.interceptor';
import { PosterResDto } from '@/common/dto/poster.dto';
import { Duration } from '@/common/app.constants';

@Controller('person')
@UseInterceptors(TMDBErrorInterceptor)
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get(':id')
  @Header('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`)
  async getPersonInfo(@Param('id') id: number): Promise<PersonResDto> {
    return this.personService.getPersonInfo(id);
  }

  @Get(':id/posters')
  @Header('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`)
  async getCombinedPosters(@Param('id') id: number): Promise<PosterResDto> {
    return this.personService.getCombinedPosters(id);
  }
}
