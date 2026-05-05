import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Vibrant } from 'node-vibrant/node';
import sharp from 'sharp';
import { encode } from 'blurhash';
import {
  DEFAULT_BLURHASH,
  DEFAULT_PRIMARY_COLOR_HEX,
} from '../common/app.constants';
import { getPlaceholderBlurhash } from './blurhash-placeholders';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  /**
   * Generates a deterministic placeholder blurhash based on the media ID.
   * This is fast and uses zero background resources.
   */
  generatePlaceholderBlurhash({ id }: { id: string | number }): string {
    return getPlaceholderBlurhash(id);
  }

  /**
   * Generates a real blurhash by fetching and processing the image.
   * This is a heavy operation and should only be used for detail views where the result is cached.
   */
  async generateRealBlurhash({
    imageUrl,
  }: {
    imageUrl: string;
  }): Promise<string> {
    try {
      const buffer = await this.getImageBufferUrl(imageUrl);
      const blurhash = await this.getBlurhash(buffer);

      if (!blurhash) {
        this.logger.warn(
          `Blurhash extraction returned no result for ${imageUrl}`,
        );
        return DEFAULT_BLURHASH;
      }

      return blurhash;
    } catch (error) {
      this.logger.error(
        `Error generating real blurhash for ${imageUrl}`,
        error,
      );
      return DEFAULT_BLURHASH;
    }
  }

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

  private async getImageBufferUrl(url: string): Promise<Buffer<ArrayBuffer>> {
    // Use a smaller version of the image to save bandwidth/CPU
    const processingUrl = url.replace('/original/', '/w500/');
    const response = await axios.get<ArrayBuffer>(processingUrl, {
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data);
  }
}
