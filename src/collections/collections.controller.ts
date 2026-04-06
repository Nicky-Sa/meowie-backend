// src/collections/collections.controller.ts
import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import {
  CollectionItemQueryDto,
  CollectionQueryDto,
  CollectionResDto,
} from './dto/collection.dto';
import { TMDBErrorInterceptor } from '../common/interceptors/tmdb-error.interceptor';
import { PosterResDto } from '../common/dto/poster.dto';

@Controller('collections')
@UseInterceptors(TMDBErrorInterceptor)
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=3600')
  async getCollections(
    @Query() query: CollectionQueryDto,
  ): Promise<CollectionResDto[]> {
    const parsedParentId = query.parentId ? Number(query.parentId) : null;
    return this.collectionsService.getCollections(parsedParentId);
  }

  @Get(':slug/items')
  @Header('Cache-Control', 'public, max-age=3600')
  async getCollectionItems(
    @Param('slug') slug: string,
    @Query() query: CollectionItemQueryDto,
  ): Promise<PosterResDto> {
    return this.collectionsService.getCollectionItems(slug, Number(query.page));
  }
}
