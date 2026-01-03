import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
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
import { MoviePosterResDto } from '../movies/dto/movies.dto';
import { MoviesService } from '../movies/movies.service';
import { PostersQueryDto } from './dto/posters.dto';

@Controller('movie-states')
export class MovieStatesController {
  constructor(
    private readonly movieStatesService: MovieStatesService,
    private readonly moviesService: MoviesService,
  ) {}

  @OptionalAccessGuard()
  @Get('posters')
  async getPostersInBulk(
    @Req() req: OptionallyAuthenticatedRequest,
    @Query() query: PostersQueryDto,
  ): Promise<MoviePosterResDto> {
    if (!req.user.id) {
      return { results: [], page: 1, total_pages: 1, total_results: 0 };
    }
    const movieIds = await this.movieStatesService.getBookmarkedMovieIds(
      query,
      req.user.id,
    );
    return this.moviesService.getMoviesPoster(movieIds);
  }

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
