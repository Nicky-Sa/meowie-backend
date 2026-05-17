import {
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CollectionsService } from '@/collections/collections.service';
import {
  CollectionItemQueryDto,
  CollectionQueryDto,
  CollectionResDto,
} from '@/collections/dto/collection.dto';
import { CollectionsSyncService } from '@/collections/collections-sync.service';
import { CronGuard } from '@/auth/guards/cron.guard';
import { TMDBErrorInterceptor } from '@/common/interceptors/tmdb-error.interceptor';
import { PosterResDto } from '@/common/dto/poster.dto';
import { Duration } from '@/common/app.constants';

@Controller('collections')
@UseInterceptors(TMDBErrorInterceptor)
export class CollectionsController {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly collectionsSyncService: CollectionsSyncService,
  ) {}

  @Get()
  @Header('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`)
  async getCollections(
    @Query() query: CollectionQueryDto,
  ): Promise<CollectionResDto[]> {
    const parsedParentId = query.parentId ? Number(query.parentId) : null;
    return this.collectionsService.getCollections(parsedParentId);
  }

  @Get(':slug/items')
  @Header('Cache-Control', `public, max-age=${Duration.ONE_HOUR}`)
  async getCollectionItems(
    @Param('slug') slug: string,
    @Query() query: CollectionItemQueryDto,
  ): Promise<PosterResDto> {
    return this.collectionsService.getCollectionItems(slug, Number(query.page));
  }

  @Post('sync')
  @UseGuards(CronGuard)
  async syncCollections() {
    // Run them sequentially or in parallel? Parallel is faster.
    // We don't wait for them to finish in a real cron if we want to return 200 fast,
    // but here it's better to wait to know if it succeeded.
    await Promise.all([
      this.collectionsSyncService.syncImdbTop250Movies(),
      this.collectionsSyncService.syncImdbTop250Series(),
      this.collectionsSyncService.syncLetterboxdTop250Narrative(),
      this.collectionsSyncService.syncLetterboxdTop250Documentaries(),
    ]);
    return { message: 'Sync completed successfully' };
  }
}
