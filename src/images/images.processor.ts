import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ImagesService } from './images.service';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { IMAGE_QUEUE } from '../common/queue.constants';

type ExtractPropsJobData = {
  url: string;
};

@Processor(IMAGE_QUEUE.name, {
  concurrency: 8,
})
export class ImagesProcessor extends WorkerHost implements OnModuleDestroy {
  private readonly logger = new Logger(ImagesProcessor.name);

  constructor(private readonly imagesService: ImagesService) {
    super();
  }

  async process(job: Job<ExtractPropsJobData>): Promise<void> {
    try {
      switch (job.name) {
        case IMAGE_QUEUE.jobs.extractBlurhash:
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

  async onModuleDestroy() {
    this.logger.log('Pausing and shutting down image worker...');
    await this.worker.pause();
    await this.worker.close();
  }
}
