import { Controller, Get } from '@nestjs/common';
import { GenresResDto } from '@/constants/constants.dto';
import { ConstantsService } from '@/constants/constants.service';

@Controller('constants')
export class ConstantsController {
  constructor(private readonly constantsService: ConstantsService) {}

  @Get('genres')
  async getGenres(): Promise<GenresResDto> {
    return this.constantsService.getGenres();
  }
}
