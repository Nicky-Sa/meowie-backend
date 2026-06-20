import {
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Req,
  Body,
  Delete,
} from '@nestjs/common';
import { LibraryService } from '@/library/library.service';
import {
  AuthenticatedRequest,
  OptionallyAuthenticatedRequest,
} from '@/auth/types/authenticated-request.type';
import { AccessGuard } from '@/auth/guards/access.guard';
import { OptionalAccessGuard } from '@/auth/guards/optional-access.guard';
import {
  LibraryStatusResDto,
  LibraryItemQueryDto,
  RatingReqDto,
} from '@/library/dto/library.dto';

import { MediaType } from '@/types/media-type';
import { LibraryCategory } from '@/library/constants/library.constants';
import { PosterResDto } from '@/common/dto/poster.dto';
import { EMPTY_PAGINATED_RESULTS } from '@/common/types/paginated-response';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @OptionalAccessGuard()
  @Get(':category')
  async getLibraryItemsPosters(
    @Req() req: OptionallyAuthenticatedRequest,
    @Param('category') category: LibraryCategory,
    @Query() query: LibraryItemQueryDto,
  ): Promise<PosterResDto> {
    if (!req.user?.id) {
      return EMPTY_PAGINATED_RESULTS;
    }
    return this.libraryService.getLibraryItemsPosters(
      req.user.id,
      category,
      query,
    );
  }

  @OptionalAccessGuard()
  @Get(':mediaType/:tmdbId/status')
  async getStatus(
    @Req() req: OptionallyAuthenticatedRequest,
    @Param('mediaType') mediaType: MediaType,
    @Param('tmdbId') tmdbId: number,
  ): Promise<LibraryStatusResDto> {
    if (!req.user?.id) {
      return { saved: false, seen: false };
    }
    return this.libraryService.getStatus(req.user.id, { mediaType, tmdbId });
  }

  @AccessGuard()
  @Put(':mediaType/:tmdbId/seen')
  async markAsSeen(
    @Req() req: AuthenticatedRequest,
    @Param('mediaType') mediaType: MediaType,
    @Param('tmdbId') tmdbId: number,
    @Body() dto: RatingReqDto,
  ): Promise<LibraryStatusResDto> {
    return this.libraryService.markAsSeen(
      req.user.id,
      {
        mediaType,
        tmdbId,
      },
      dto.rating,
    );
  }

  @AccessGuard()
  @Patch(':mediaType/:tmdbId/seen')
  async updateRating(
    @Req() req: AuthenticatedRequest,
    @Param('mediaType') mediaType: MediaType,
    @Param('tmdbId') tmdbId: number,
    @Body() dto: RatingReqDto,
  ): Promise<LibraryStatusResDto> {
    return this.libraryService.updateRating(
      req.user.id,
      {
        mediaType,
        tmdbId,
      },
      dto.rating,
    );
  }

  @AccessGuard()
  @Delete(':mediaType/:tmdbId/seen')
  async removeSeen(
    @Req() req: AuthenticatedRequest,
    @Param('mediaType') mediaType: MediaType,
    @Param('tmdbId') tmdbId: number,
  ): Promise<LibraryStatusResDto> {
    return this.libraryService.removeItem(req.user.id, {
      mediaType,
      tmdbId,
    });
  }

  @AccessGuard()
  @Put(':mediaType/:tmdbId/saved')
  async markAsSaved(
    @Req() req: AuthenticatedRequest,
    @Param('mediaType') mediaType: MediaType,
    @Param('tmdbId') tmdbId: number,
  ): Promise<LibraryStatusResDto> {
    return this.libraryService.markAsSaved(req.user.id, {
      mediaType,
      tmdbId,
    });
  }

  @AccessGuard()
  @Delete(':mediaType/:tmdbId/saved')
  async removeSaved(
    @Req() req: AuthenticatedRequest,
    @Param('mediaType') mediaType: MediaType,
    @Param('tmdbId') tmdbId: number,
  ): Promise<LibraryStatusResDto> {
    return this.libraryService.removeItem(req.user.id, {
      mediaType,
      tmdbId,
    });
  }
}
