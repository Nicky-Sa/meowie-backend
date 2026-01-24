import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';

@Entity('saved')
@Unique(['userId', 'tmdbId']) // Ensures a user can only save a movie once
export class Saved {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userId: number;

  @Index()
  @Column({ type: 'int' })
  tmdbId: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.saved, { onDelete: 'CASCADE' })
  user: User;
}
