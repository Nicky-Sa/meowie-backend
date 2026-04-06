// src/collections/entities/collection-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Collection } from './collection.entity';

@Entity('collection_items')
@Unique(['collectionId', 'tmdbId'])
export class CollectionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'collection_id', type: 'int' })
  collectionId: number;

  @Column({ name: 'tmdb_id', type: 'int' })
  tmdbId: number;

  @Column({ type: 'int', unique: true })
  position: number;

  @ManyToOne(() => Collection, (cat) => cat.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;
}
