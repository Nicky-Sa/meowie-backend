import { Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { LibraryService } from './library.service';
import {
  AuthenticatedRequest,
  OptionallyAuthenticatedRequest,
} from '../auth/types/authenticated-request.type';
import { AccessGuard } from '../auth/guards/access.guard';
import { OptionalAccessGuard } from '../auth/guards/optional-access.guard';
import {
  ToggleLibraryItemReqDto,
  LibraryStatusResDto,
  LibraryItemQueryDto,
} from './dto/library.dto';
import { Body } from '@nestjs/common';
import { MediaType } from '../types/media-type';
import { LibraryCategory } from './library.constants';
import { PosterResDto } from '../common/dto/poster.dto';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @OptionalAccessGuard()
  @Get(':category/:mediaType')
  async getLibraryItemsPosters(
    @Req() req: OptionallyAuthenticatedRequest,
    @Param('category') category: LibraryCategory,
    @Param('mediaType') mediaType: MediaType,
    @Query() query: LibraryItemQueryDto,
  ): Promise<PosterResDto> {
    if (!req.user?.id) {
      return { results: [], page: 1, total_pages: 1, total_results: 0 };
    }
    return this.libraryService.getLibraryItemsPosters(
      req.user.id,
      category,
      mediaType,
      query,
    );
  }

  @OptionalAccessGuard()
  @Get('status/:mediaType/:tmdbId')
  async getStatus(
    @Req() req: OptionallyAuthenticatedRequest,
    @Param('mediaType') mediaType: MediaType,
    @Param('tmdbId') tmdbId: number,
  ): Promise<LibraryStatusResDto> {
    if (!req.user?.id) {
      return {};
    }
    return this.libraryService.getStatus(req.user.id, mediaType, tmdbId);
  }

  @AccessGuard()
  @Post()
  async toggleItem(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ToggleLibraryItemReqDto,
  ): Promise<LibraryStatusResDto> {
    return this.libraryService.toggleItem(req.user.id, dto);
  }
}
