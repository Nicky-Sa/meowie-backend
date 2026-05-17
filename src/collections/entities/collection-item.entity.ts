import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Collection } from '@/collections/entities/collection.entity';

@Entity('collection_items')
@Unique(['collectionId', 'tmdbId', 'position'])
export class CollectionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'collection_id', type: 'int' })
  collectionId: number;

  @Column({ name: 'tmdb_id', type: 'int' })
  tmdbId: number;

  @Column({ type: 'int' })
  position: number;

  @ManyToOne(() => Collection, (cat) => cat.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
