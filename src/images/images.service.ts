import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Vibrant } from 'node-vibrant/node';
import sharp from 'sharp';
import { encode } from 'blurhash';
import { Cacheable } from '../cache/cacheable.decorator';
import { CacheService } from '../cache/cache.service';
import { PosterProps } from '../types/poster';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(private readonly cacheService: CacheService) {}

  @Cacheable({
    key: (url: string) => `poster-props-${url}`,
    ttl: 3600 * 24 * 30,
  })
  async generatePosterProps(url: string): Promise<PosterProps> {
    let primaryColorHex = '#1F3854';
    let blurhash = 'U11o;?of00of00of00of00of00of00of00of';

    try {
      const response = await axios.get<ArrayBuffer>(url, {
        responseType: 'arraybuffer',
      });
      const buffer = Buffer.from(response.data);

      const [hexResult, blurhashResult] = await Promise.allSettled([
        this.getPrimaryColorHex(buffer),
        this.getBlurhash(buffer),
      ]);

      if (hexResult.status === 'fulfilled' && hexResult.value) {
        primaryColorHex = hexResult.value;
      }

      if (blurhashResult.status === 'fulfilled' && blurhashResult.value) {
        blurhash = blurhashResult.value;
      }

      return { primaryColorHex, blurhash };
    } catch (error) {
      if (error instanceof AggregateError) {
        this.logger.error(
          `AggregateError generating poster props: ${error.message}\n`,
          `Errors: ${error.errors.join('\n ')}`,
        );
      }
      this.logger.error(`Error generating poster props: ${error}`);
    }
    return {
      primaryColorHex,
      blurhash,
    };
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
}
