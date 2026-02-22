import {
  Controller,
  Get,
  Header,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonResDto, RoleInMovieResDto } from './dto/person.dto';
import { TMDBErrorInterceptor } from '../common/interceptors/tmdb-error.interceptor';
import { PosterResDto } from '../common/dto/poster.dto';

@Controller('person')
@UseInterceptors(TMDBErrorInterceptor)
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get(':id')
  @Header('Cache-Control', 'public, max-age=3600')
  async getPersonInfo(@Param('id') id: number): Promise<PersonResDto> {
    return this.personService.getPersonInfo(id);
  }

  @Get(':id/posters')
  @Header('Cache-Control', 'public, max-age=3600')
  async getTvPostersInBulk(@Param('id') id: number): Promise<PosterResDto> {
    return this.personService.getCombinedPosters(id);
  }

  @Get(':personId/role/:movieId')
  @Header('Cache-Control', 'public, max-age=3600')
  async getRoleInMovie(
    @Param('personId') personId: number,
    @Param('movieId') movieId: number,
  ): Promise<RoleInMovieResDto> {
    return this.personService.getRoleInMovie(personId, movieId);
  }
}
