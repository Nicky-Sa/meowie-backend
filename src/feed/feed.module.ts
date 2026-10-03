import { Module } from '@nestjs/common';
import { FeedController } from '@/feed/feed.controller';
import { FeedService } from '@/feed/feed.service';
import { MovieModule } from '@/movie/movie.module';
import { SeriesModule } from '@/series/series.module';
import { TasteModule } from '@/taste/taste.module';
import { LibraryModule } from '@/library/library.module';
import { FEED_INPUTS, InputService } from '@/feed/engine/input/input.service';
import { InputResult } from '@/feed/engine/input/input.types';
import { TasteInputService } from '@/feed/engine/input/taste/taste.service';
import { LibraryInputService } from '@/feed/engine/input/library/library.service';

const inputServices = [TasteInputService, LibraryInputService];

@Module({
  imports: [MovieModule, SeriesModule, TasteModule, LibraryModule],
  controllers: [FeedController],
  providers: [
    FeedService,
    ...inputServices,
    {
      provide: FEED_INPUTS,
      useFactory: (...inputs: InputService<InputResult>[]) => inputs,
      inject: inputServices,
    },
  ],
})
export class FeedModule {}
