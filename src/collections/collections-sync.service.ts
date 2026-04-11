import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { CollectionItem } from './entities/collection-item.entity';
import { TmdbService } from '../tmdb/tmdb.service';
import {
  scrapeImdbTop250,
  scrapeImdbTop250Series,
  scrapeLetterboxdList,
} from './utils/scrapers';

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
   * Cron job that runs every week to sync the Letterboxd Top 250 Narrative list.
   */
  @Cron(CronExpression.EVERY_WEEK)
  async syncLetterboxdTop250Narrative() {
    await this.syncLetterboxdCollection({
      slug: 'letterboxd-top-250-narratives',
      url: 'https://letterboxd.com/official/list/the-2010s-top-250-narrative-features/',
      label: 'Letterboxd Top 250 Narrative',
    });
  }

  /**
   * Cron job that runs every week to sync the Letterboxd Top 250 Documentaries list.
   */
  @Cron(CronExpression.EVERY_WEEK)
  async syncLetterboxdTop250Documentaries() {
    await this.syncLetterboxdCollection({
      slug: 'letterboxd-top-250-documentaries',
      url: 'https://letterboxd.com/official/list/top-250-documentary-films/',
      label: 'Letterboxd Top 250 Documentaries',
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
          } else {
            this.logger.error(`⚠️ TMDB id for ${imdbId} in IMDB not found.`);
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

      await this.saveItems(collection, items);
      this.logger.log(
        `✅ Successfully synced ${items.length} items to "${collection.title}"`,
      );
    } catch (error) {
      this.logger.error(
        `💥 Critical error during ${label} synchronization:`,
        error,
      );
    }
  }
  /**
   * Generic method to sync a Letterboxd collection.
   */
  private async syncLetterboxdCollection(options: {
    slug: string;
    url: string;
    label: string;
  }) {
    const { slug, url, label } = options;
    this.logger.log(`🚀 Starting ${label} sync sequence...`);

    try {
      // 1. Scrape Letterboxd for metadata
      const films = await scrapeLetterboxdList(url);
      if (!films.length) {
        this.logger.warn(
          `⚠️ No films found during scrape for ${label}. Aborting sync.`,
        );
        return;
      }

      this.logger.log(
        `🔍 Scraped ${films.length} films for ${label}. Proceeding to TMDB search...`,
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

      // 3. Map Titles/Years to TMDB IDs
      const items: { tmdbId: number; rank: number }[] = [];

      for (let i = 0; i < films.length; i++) {
        const film = films[i];

        try {
          // Attempt search with year for maximum accuracy
          let searchRes = await this.tmdbService.searchMovie(
            film.title,
            film.year,
          );
          let result = searchRes.results?.[0];

          // Fallback: If no results with year, try without year
          // (Sometimes premiere years differ between Letterboxd and TMDB)
          if (!result) {
            searchRes = await this.tmdbService.searchMovie(film.title);
            result = searchRes.results?.[0];
          }

          if (result) {
            items.push({
              tmdbId: result.id,
              rank: i + 1,
            });
          } else {
            this.logger.error(
              `⚠️ TMDB id for ${film.title} in Letterboxd not found.`,
            );
          }
        } catch (error) {
          this.logger.error(
            `❌ Failed to find TMDB ID for Letterboxd film "${film.title}" (${film.year})`,
            error,
          );
        }

        // Small delay every 10 items to be polite to the API
        if (i > 0 && i % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      await this.saveItems(collection, items);
      this.logger.log(
        `✅ Successfully synced ${items.length} items to "${collection.title}"`,
      );
    } catch (error) {
      this.logger.error(
        `💥 Critical error during ${label} synchronization:`,
        error,
      );
    }
  }

  /**
   * Generic method to save items to a collection.
   */
  private async saveItems(
    collection: Collection,
    items: { tmdbId: number; rank: number }[],
  ) {
    if (items.length > 0) {
      await this.collectionItemRepository.manager.transaction(
        async (transactionalEntityManager) => {
          // Clear existing items for this collection settings
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
    }
  }
}
