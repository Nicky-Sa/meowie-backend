import { Controller, Get, Header, Param } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonResDto } from './dto/person.dto';

@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Get(':id')
  @Header('Cache-Control', 'public, max-age=3600')
  async getPersonInfo(@Param('id') id: number): Promise<PersonResDto> {
    return this.personService.getPersonInfo(id);
  }
}
