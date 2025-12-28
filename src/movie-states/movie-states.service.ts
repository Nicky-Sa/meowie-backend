import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MovieStatesService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
  ) {}

  async getMovieStates(userId: number, tmdbId: number) {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { userId, tmdbId },
    });

    return { bookmarked: Boolean(bookmark) };
  }

  /**
   * Logic: If bookmark exists, delete it. If not, create it.
   */
  async toggleBookmark(userId: number, tmdbId: number) {
    const existing = await this.bookmarkRepository.findOne({
      where: { userId, tmdbId },
    });

    if (existing) {
      await this.bookmarkRepository.remove(existing);
      return { bookmarked: false };
    }

    const newBookmark = this.bookmarkRepository.create({
      userId,
      tmdbId,
    });

    await this.bookmarkRepository.save(newBookmark);
    return { bookmarked: true };
  }
}
