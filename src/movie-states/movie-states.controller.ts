import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { MovieStatesService } from './movie-states.service';
import {
  AuthenticatedRequest,
  OptionallyAuthenticatedRequest,
} from '../auth/types/authenticated-request.type';
import {
  ToggleBookmarkReqDto,
  ToggleBookmarkResDto,
} from './dto/toggle-bookmark.dto';
import { MovieStatesResDto } from './dto/movie-states.dto';
import { AccessGuard } from '../auth/guards/access.guard';
import { OptionalAccessGuard } from '../auth/guards/optional-access.guard';

@Controller('movie-states')
export class MovieStatesController {
  constructor(private readonly movieStatesService: MovieStatesService) {}

  @OptionalAccessGuard()
  @Get(':id')
  async getMovieStates(
    @Req() req: OptionallyAuthenticatedRequest,
    @Param('id') id: number,
  ): Promise<MovieStatesResDto> {
    if (!req.user.id) {
      return { bookmarked: false };
    }
    return this.movieStatesService.getMovieStates(req.user.id, id);
  }

  @AccessGuard()
  @Post('bookmark')
  toggleBookmark(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ToggleBookmarkReqDto,
  ): Promise<ToggleBookmarkResDto> {
    return this.movieStatesService.toggleBookmark(req.user.id, dto.id);
  }
}
