import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Vibrant } from 'node-vibrant/node';
import sharp from 'sharp';
import { encode } from 'blurhash';
import { CacheService } from '../cache/cache.service';
import { Cacheable } from '../cache/cacheable.decorator';
import {
  DEFAULT_BLURHASH,
  DEFAULT_PRIMARY_COLOR_HEX,
  Duration,
} from '../common/app.constants';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    private readonly cacheService: CacheService,
    @InjectQueue('image') private readonly imageQueue: Queue,
  ) {}

  async generateBlurhash(url: string): Promise<string> {
    const cached = await this.cacheService.get<string>(
      this.getBlurhashCacheKey(url),
    );

    if (cached) {
      return cached;
    }

    await this.imageQueue.add(
      'extract-blurhash',
      { url },
      {
        jobId: `blurhash-${this.sanitizeUrlForJobId(url)}`,
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    );

    return DEFAULT_BLURHASH;
  }

  @Cacheable({
    key: (url: string) => `primary-color-${url}`,
    ttl: Duration.ONE_YEAR,
  })
  async generatePrimaryColorHex(url: string): Promise<string> {
    try {
      const buffer = await this.getImageBufferUrl(url);
      const result = await this.getPrimaryColorHex(buffer);

      if (!result) {
        this.logger.warn(
          `Primary color extraction returned no result for ${url}`,
        );
        return DEFAULT_PRIMARY_COLOR_HEX;
      }

      return result;
    } catch (error) {
      this.logger.error(`Error generating primary color for ${url}`, error);
      return DEFAULT_PRIMARY_COLOR_HEX;
    }
  }

  async processAndCacheBlurhash(url: string): Promise<void> {
    try {
      const buffer = await this.getImageBufferUrl(url);
      const result = await this.getBlurhash(buffer);

      if (!result) {
        this.logger.warn(`Blurhash extraction returned no result for ${url}`);
        return; // Don't cache the default — let the next request retry
      }

      await this.cacheService.set(
        this.getBlurhashCacheKey(url),
        result,
        Duration.ONE_YEAR,
      );
    } catch (error) {
      this.logger.error(`Error generating blurhash for ${url}`, error);
      return; // Do not cache on failure
    }
  }

  private async getPrimaryColorHex(
    buffer: Buffer,
  ): Promise<string | undefined> {
    const palette = await Vibrant.from(buffer).getPalette();
    return palette.LightVibrant?.hex;
  }

  private async getBlurhash(buffer: Buffer): Promise<string | undefined> {
    const { data, info } = await sharp(buffer)
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: 'inside' })
      .toBuffer({ resolveWithObject: true });

    return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
  }

  private getBlurhashCacheKey(url: string): string {
    return `blurhash-${url}`;
  }

  private async getImageBufferUrl(url: string): Promise<Buffer<ArrayBuffer>> {
    // Use a smaller version of the image to save bandwidth/CPU
    const processingUrl = url.replace('/original/', '/w500/');
    const response = await axios.get<ArrayBuffer>(processingUrl, {
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data);
  }

  private sanitizeUrlForJobId(url: string): string {
    return url.replace(/:/g, '_');
  }
}
