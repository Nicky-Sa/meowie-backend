import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { CollectionItem } from './entities/collection-item.entity';
import { TmdbService } from '../tmdb/tmdb.service';
import { scrapeImdbTop250 } from './utils/scrapers';

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
   * Cron job that runs every week to sync the IMDB Top 250 list.
   * It scrapes the list from IMDB, maps IMDB IDs to TMDB IDs,
   * and updates the manual collection.
   */
  @Cron(CronExpression.EVERY_WEEK)
  async syncImdbTop250() {
    const COLLECTION_SLUG = 'imdb-top-250-movies';
    this.logger.log('🚀 Starting IMDB Top 250 sync sequence...');

    try {
      // 1. Scrape IMDB Top 250 for IMDB IDs (ttXXXXXXX)
      const imdbIds = await scrapeImdbTop250();
      if (!imdbIds.length) {
        this.logger.warn('⚠️ No IMDB IDs found during scrape. Aborting sync.');
        return;
      }
      this.logger.log(
        `🔍 Scraped ${imdbIds.length} IMDB IDs. Proceeding to TMDB mapping...`,
      );

      // 2. Ensure the "Top 250 IMDB Movies" collection exists
      const collection = await this.collectionRepository.findOneBy({
        slug: COLLECTION_SLUG,
      });

      if (!collection) {
        this.logger.error(
          '🤔 Collection not found. Please make sure the collection exists, and then try again.',
        );
        return;
      }

      // 3. Map IMDB IDs to TMDB IDs
      const movieItems: { tmdbId: number; rank: number }[] = [];

      // We process them in chunks to avoid overwhelming the TMDB API
      for (let i = 0; i < imdbIds.length; i++) {
        const imdbId = imdbIds[i];

        try {
          const findRes = await this.tmdbService.findByExternalId(
            imdbId,
            'imdb_id',
          );
          const movie = findRes.movie_results?.[0];

          if (movie) {
            movieItems.push({
              tmdbId: movie.id,
              rank: i + 1,
            });
          }
        } catch (error) {
          this.logger.error(
            `❌ Failed to find TMDB ID for IMDB ID ${imdbId}`,
            error,
          );
        }

        // Small delay every 10 items to be polite to the API
        if (i > 0 && i % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      if (movieItems.length > 0) {
        // 4. Update the collection items within a transaction
        await this.collectionItemRepository.manager.transaction(
          async (transactionalEntityManager) => {
            // Clear existing items for this collection to maintain freshness
            await transactionalEntityManager.delete(CollectionItem, {
              collectionId: collection.id,
            });

            const itemsToSave = movieItems.map((item) => {
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
          `✅ Successfully synced ${movieItems.length} movies to "${collection.title}"`,
        );
      }
    } catch (error) {
      this.logger.error(
        '💥 Critical error during IMDB synchronization profile:',
        error,
      );
    }
  }
}
