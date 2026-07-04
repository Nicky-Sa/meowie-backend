import { ApiProperty } from '@nestjs/swagger';

export class ReleaseNoteResDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  emoji: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  version: string;

  @ApiProperty()
  createdAt: Date;
}
