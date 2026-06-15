import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Taste } from '@/taste/entities/taste.entity';
import { UpsertTasteReqDto, TasteResDto } from '@/taste/dto/upsert-taste.dto';
import { UserService } from '@/user/user.service';
import { DataSource } from 'typeorm';

@Injectable()
export class TasteService {
  constructor(
    @InjectRepository(Taste)
    private readonly tasteRepository: Repository<Taste>,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  async upsert(userId: number, dto: UpsertTasteReqDto): Promise<TasteResDto> {
    await this.dataSource.transaction(async (manager) => {
      // 1. Upsert taste data
      await manager.upsert(
        Taste,
        {
          userId,
          keywords: dto.keywords,
          flexibility: dto.flexibility,
        },
        {
          conflictPaths: ['userId'],
        },
      );

      // 2. Mark user as having filled in taste
      await this.userService.update(userId, { hasFilledInTaste: true });
    });

    return {
      keywords: dto.keywords,
      flexibility: dto.flexibility,
    };
  }

  async findByUserId(userId: number): Promise<TasteResDto | null> {
    const taste = await this.tasteRepository.findOneBy({ userId });

    if (!taste) {
      return null;
    }

    return {
      keywords: taste.keywords,
      flexibility: taste.flexibility,
    };
  }
}
