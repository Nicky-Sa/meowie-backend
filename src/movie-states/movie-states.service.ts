import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Saved } from './entities/saved.entity';
import { Repository } from 'typeorm';
import { LIMIT } from '../utils/constants';
import { PostersQueryDto } from './dto/posters.dto';

@Injectable()
export class MovieStatesService {
  constructor(
    @InjectRepository(Saved)
    private savedRepository: Repository<Saved>,
  ) {}

  async getMovieStates(userId: number, tmdbId: number) {
    const saved = await this.savedRepository.findOne({
      where: { userId, tmdbId },
    });

    return { saved: Boolean(saved) };
  }

  /**
   * Logic: If saved exists, delete it. If not, create it.
   */
  async toggleSave(userId: number, tmdbId: number) {
    const existing = await this.savedRepository.findOne({
      where: { userId, tmdbId },
    });

    if (existing) {
      await this.savedRepository.remove(existing);
      return { saved: false };
    }

    const newItem = this.savedRepository.create({
      userId,
      tmdbId,
    });

    await this.savedRepository.save(newItem);
    return { saved: true };
  }

  async getSavedMovieIds(query: PostersQueryDto, userId: number) {
    const page = query.page;

    const skip = (page - 1) * LIMIT;

    const [saved, total] = await this.savedRepository.findAndCount({
      where: { userId },
      order: {
        createdAt: 'DESC',
      },
      take: LIMIT,
      skip,
    });
    const results = saved.map((item) => item.tmdbId);

    return {
      results,
      page,
      total_pages: Math.ceil(total / LIMIT),
      total_results: total,
    };
  }
}
