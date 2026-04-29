import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ImagesService } from './images.service';
import { Logger } from '@nestjs/common';

type ExtractPropsJobData = {
  url: string;
};

@Processor('image')
export class ImagesProcessor extends WorkerHost {
  private readonly logger = new Logger(ImagesProcessor.name);

  constructor(private readonly imagesService: ImagesService) {
    super();
  }

  async process(job: Job<ExtractPropsJobData>): Promise<void> {
    try {
      switch (job.name) {
        case 'extract-blurhash':
          await this.imagesService.processAndCacheBlurhash(job.data.url);
          break;
        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
          break;
      }
    } catch (error) {
      this.logger.error(
        `Failed to process ${job.name} for ${job.data.url}:`,
        error,
      );
      throw error; // Throwing will trigger BullMQ's retry mechanism
    }
  }
}
