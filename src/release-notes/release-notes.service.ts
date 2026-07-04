import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReleaseNote } from '@/release-notes/entities/release-note.entity';
import { ReleaseNoteResDto } from '@/release-notes/dto/release-note.dto';

@Injectable()
export class ReleaseNotesService {
  constructor(
    @InjectRepository(ReleaseNote)
    private readonly releaseNoteRepository: Repository<ReleaseNote>,
  ) {}

  async getReleaseNotes(): Promise<ReleaseNoteResDto[]> {
    return this.releaseNoteRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        emoji: true,
        title: true,
        description: true,
        version: true,
        createdAt: true,
      },
    });
  }
}
