import { ApiProperty } from '@nestjs/swagger';
import {
  CollectionMediaType,
  CollectionSourceType,
} from '@/collections/collections.constants';
import { Page } from '@/common/types/media-query';
import { IsOptional } from 'class-validator';

export class CollectionResDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  logoUrl: string;

  @ApiProperty()
  mediaType: CollectionMediaType;

  @ApiProperty()
  sourceType: CollectionSourceType;

  @ApiProperty()
  backdropUrl: string;

  @ApiProperty()
  colorHex: string;
}

export class CollectionQueryDto {
  @IsOptional()
  parentId?: number;
}

export class CollectionItemQueryDto extends Page {}
