import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { MovieStatesService } from './movie-states.service';
import { AuthenticatedRequest } from '../auth/types/authenticated-request.type';
import {
  ToggleBookmarkReqDto,
  ToggleBookmarkResDto,
} from './dto/toggle-bookmark.dto';
import { MovieStatesResDto } from './dto/movie-states.dto';
import { AccessGuard } from '../auth/guards/access.guard';

@AccessGuard()
@Controller('movie-states')
export class MovieStatesController {
  constructor(private readonly movieStatesService: MovieStatesService) {}

  @Get(':id')
  async getMovieStates(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: number,
  ): Promise<MovieStatesResDto> {
    return this.movieStatesService.getMovieStates(req.user.id, id);
  }

  @Post('bookmark')
  toggleBookmark(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ToggleBookmarkReqDto,
  ): Promise<ToggleBookmarkResDto> {
    return this.movieStatesService.toggleBookmark(req.user.id, dto.id);
  }
}
