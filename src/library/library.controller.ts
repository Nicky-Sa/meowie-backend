import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import {
  AuthenticatedRequest,
  OptionallyAuthenticatedRequest,
} from '../auth/types/authenticated-request.type';
import { AccessGuard } from '../auth/guards/access.guard';
import { OptionalAccessGuard } from '../auth/guards/optional-access.guard';
import {
  LibraryStatusResDto,
  LibraryItemQueryDto,
  MarkSeenReqDto,
  UpdateRatingReqDto,
  MarkSavedReqDto,
  RemoveItemReqDto,
} from './dto/library.dto';
import { Body, Delete } from '@nestjs/common';
import { MediaType } from '../types/media-type';
import { LibraryCategory } from './library.constants';
import { PosterResDto } from '../common/dto/poster.dto';
import { EMPTY_PAGINATED_RESULTS } from '../common/types/paginated-response';

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
  @Get('status/:mediaType/:tmdbId')
  async getStatus(
    @Req() req: OptionallyAuthenticatedRequest,
    @Param('mediaType') mediaType: MediaType,
    @Param('tmdbId') tmdbId: number,
  ): Promise<LibraryStatusResDto> {
    if (!req.user?.id) {
      return { saved: false, seen: false };
    }
    return this.libraryService.getStatus(req.user.id, mediaType, tmdbId);
  }

  @AccessGuard()
  @Post('seen')
  async markAsSeen(
    @Req() req: AuthenticatedRequest,
    @Body() dto: MarkSeenReqDto,
  ): Promise<LibraryStatusResDto> {
    return this.libraryService.markAsSeen(req.user.id, dto);
  }

  @AccessGuard()
  @Post('save')
  async markAsSaved(
    @Req() req: AuthenticatedRequest,
    @Body() dto: MarkSavedReqDto,
  ): Promise<LibraryStatusResDto> {
    return this.libraryService.markAsSaved(req.user.id, dto);
  }

  @AccessGuard()
  @Delete('seen')
  async removeSeen(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RemoveItemReqDto,
  ): Promise<LibraryStatusResDto> {
    return this.libraryService.removeItem(req.user.id, dto);
  }

  @AccessGuard()
  @Delete('save')
  async removeSaved(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RemoveItemReqDto,
  ): Promise<LibraryStatusResDto> {
    return this.libraryService.removeItem(req.user.id, dto);
  }

  @AccessGuard()
  @Patch('rating')
  async updateRating(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateRatingReqDto,
  ): Promise<LibraryStatusResDto> {
    return this.libraryService.updateRating(req.user.id, dto);
  }
}
