import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
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
import { CollectionsSyncQueueService } from '@/collections/collections-sync-queue.service';
import { CronGuard } from '@/auth/guards/cron.guard';
import { TMDBErrorInterceptor } from '@/common/interceptors/tmdb-error.interceptor';
import { PosterResDto } from '@/common/dto/poster.dto';
import { Duration } from '@/common/app.constants';

@Controller('collections')
@UseInterceptors(TMDBErrorInterceptor)
export class CollectionsController {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly collectionsSyncQueueService: CollectionsSyncQueueService,
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
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(CronGuard)
  async syncCollections() {
    // The sync scrapes four ~250-item lists and makes hundreds of TMDB calls,
    // which takes minutes — far longer than CloudFront's 30s origin timeout.
    // Enqueue it and return immediately; the BullMQ worker runs the actual sync.
    await this.collectionsSyncQueueService.enqueueSyncAll();
    return { message: 'Collection sync queued' };
  }
}
