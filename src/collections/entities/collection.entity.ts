// src/collections/entities/collection.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CollectionItem } from '@/collections/entities/collection-item.entity';
import {
  CATEGORY_MEDIA_TYPE_VALUES,
  CATEGORY_SOURCE_TYPE_VALUES,
  CollectionMediaType,
  CollectionSourceType,
} from '@/collections/collections.constants';

@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId: number | null;

  @Column({ unique: true, type: 'varchar', length: 100 })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 500 })
  logoUrl: string;

  @Column({ name: 'backdrop_url', type: 'varchar', length: 500 })
  backdropUrl: string;

  @Column({ name: 'color_hex', type: 'varchar', length: 7 })
  colorHex: string;

  @Column({
    name: 'media_type',
    type: 'enum',
    enum: CATEGORY_MEDIA_TYPE_VALUES,
  })
  mediaType: CollectionMediaType;

  @Column({
    name: 'source_type',
    type: 'enum',
    enum: CATEGORY_SOURCE_TYPE_VALUES,
  })
  sourceType: CollectionSourceType;

  @Column({
    name: 'tmdb_endpoint',
    type: 'varchar',
    nullable: true,
    length: 255,
  })
  tmdbEndpoint: string | null;

  @Column({ name: 'tmdb_params', type: 'jsonb', nullable: true })
  tmdbParams: Record<string, string | number | boolean> | null;

  @Column({ name: 'position', type: 'int', unique: true })
  position: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  // -- Relations --

  @ManyToOne(() => Collection, (cat) => cat.children, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: Collection;

  @OneToMany(() => Collection, (cat) => cat.parent)
  children: Collection[];

  @OneToMany(() => CollectionItem, (item) => item.collection)
  items: CollectionItem[];
}
