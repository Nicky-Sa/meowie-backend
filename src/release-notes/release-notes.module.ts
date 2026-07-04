import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReleaseNotesController } from '@/release-notes/release-notes.controller';
import { ReleaseNotesService } from '@/release-notes/release-notes.service';
import { ReleaseNote } from '@/release-notes/entities/release-note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReleaseNote])],
  controllers: [ReleaseNotesController],
  providers: [ReleaseNotesService],
})
export class ReleaseNotesModule {}
