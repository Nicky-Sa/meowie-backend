import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '@/user/entities/users.entity';
import { MediaType } from '@/types/media-type';
import { LibraryCategory } from '@/library/constants/library.constants';

@Entity('library_items')
@Unique(['userId', 'tmdbId', 'mediaType'])
export class LibraryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userId: number;

  @Index()
  @Column({ type: 'int' })
  tmdbId: number;

  @Index()
  @Column()
  mediaType: MediaType;

  @Index()
  @Column()
  category: LibraryCategory;

  @Column({ type: 'int', nullable: true })
  rating: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.libraryItems, { onDelete: 'CASCADE' })
  user: User;
}
