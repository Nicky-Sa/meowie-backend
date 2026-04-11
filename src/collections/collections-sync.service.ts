import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { CollectionItem } from './entities/collection-item.entity';
import { TmdbService } from '../tmdb/tmdb.service';
import { scrapeImdbTop250, scrapeImdbTop250Series } from './utils/scrapers';

@Injectable()
export class CollectionsSyncService {
  private readonly logger = new Logger(CollectionsSyncService.name);

  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(CollectionItem)
    private readonly collectionItemRepository: Repository<CollectionItem>,
    private readonly tmdbService: TmdbService,
  ) {}

  /**
   * Cron job that runs every week to sync the IMDB Top 250 movies list.
   */
  @Cron(CronExpression.EVERY_WEEK)
  async syncImdbTop250Movies() {
    await this.syncImdbCollection({
      slug: 'imdb-top-250-movies',
      scraper: scrapeImdbTop250,
      mediaType: 'movie',
      label: 'IMDB Top 250 Movies',
    });
  }

  /**
   * Cron job that runs every week to sync the IMDB Top 250 series list.
   */
  @Cron(CronExpression.EVERY_WEEK)
  async syncImdbTop250Series() {
    await this.syncImdbCollection({
      slug: 'imdb-top-250-series',
      scraper: scrapeImdbTop250Series,
      mediaType: 'series',
      label: 'IMDB Top 250 Series',
    });
  }

  /**
   * Generic method to sync an IMDB collection.
   */
  private async syncImdbCollection(options: {
    slug: string;
    scraper: () => Promise<string[]>;
    mediaType: 'movie' | 'series';
    label: string;
  }) {
    const { slug, scraper, mediaType, label } = options;
    this.logger.log(`🚀 Starting ${label} sync sequence...`);

    try {
      // 1. Scrape IMDB for IMDB IDs (ttXXXXXXX)
      const imdbIds = await scraper();
      if (!imdbIds.length) {
        this.logger.warn(
          `⚠️ No IMDB IDs found during scrape for ${label}. Aborting sync.`,
        );
        return;
      }
      this.logger.log(
        `🔍 Scraped ${imdbIds.length} IMDB IDs for ${label}. Proceeding to TMDB mapping...`,
      );

      // 2. Ensure the collection exists
      const collection = await this.collectionRepository.findOneBy({
        slug,
      });

      if (!collection) {
        this.logger.error(
          `🤔 Collection with slug "${slug}" not found. Please make sure it exists in the database.`,
        );
        return;
      }

      // 3. Map IMDB IDs to TMDB IDs
      const items: { tmdbId: number; rank: number }[] = [];

      // We process them in chunks to avoid overwhelming the TMDB API
      for (let i = 0; i < imdbIds.length; i++) {
        const imdbId = imdbIds[i];

        try {
          const findRes = await this.tmdbService.findByExternalId(
            imdbId,
            'imdb_id',
          );

          const result =
            mediaType === 'movie'
              ? findRes.movie_results?.[0]
              : findRes.tv_results?.[0];

          if (result) {
            items.push({
              tmdbId: result.id,
              rank: i + 1,
            });
          }
        } catch (error) {
          this.logger.error(
            `❌ Failed to find TMDB ID for IMDB ID ${imdbId} (${mediaType})`,
            error,
          );
        }

        // Small delay every 10 items to be polite to the API
        if (i > 0 && i % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      if (items.length > 0) {
        // 4. Update the collection items within a transaction
        await this.collectionItemRepository.manager.transaction(
          async (transactionalEntityManager) => {
            // Clear existing items for this collection to maintain freshness
            await transactionalEntityManager.delete(CollectionItem, {
              collectionId: collection.id,
            });

            const itemsToSave = items.map((item) => {
              return this.collectionItemRepository.create({
                collectionId: collection.id,
                tmdbId: item.tmdbId,
                position: item.rank,
              });
            });

            await transactionalEntityManager.save(CollectionItem, itemsToSave);
          },
        );

        this.logger.log(
          `✅ Successfully synced ${items.length} items to "${collection.title}"`,
        );
      }
    } catch (error) {
      this.logger.error(
        `💥 Critical error during ${label} synchronization:`,
        error,
      );
    }
  }
}
