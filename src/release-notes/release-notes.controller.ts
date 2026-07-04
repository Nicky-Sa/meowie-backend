import { Controller, Get } from '@nestjs/common';
import { ReleaseNotesService } from '@/release-notes/release-notes.service';
import { ReleaseNoteResDto } from '@/release-notes/dto/release-note.dto';

@Controller('release-notes')
export class ReleaseNotesController {
  constructor(private readonly releaseNotesService: ReleaseNotesService) {}

  @Get()
  async getReleaseNotes(): Promise<ReleaseNoteResDto[]> {
    return this.releaseNotesService.getReleaseNotes();
  }
}
