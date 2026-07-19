import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  Unique,
} from 'typeorm';
import { User } from '@/user/entities/users.entity';
import { GenreId } from '@/taste/constants/pools.constant';
import {
  AuthorityAnswer,
  CommitmentAnswer,
  EraAnswer,
  RealityAnswer,
} from '@/taste/constants/journey.constant';

@Entity('taste')
@Unique(['userId'])
export class Taste {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userId: number;

  // TMDB ids of the titles picked in the movie / series steps.
  @Column('int', { array: true })
  movieIds: number[];

  @Column('int', { array: true })
  seriesIds: number[];

  @Column()
  seriesSkipped: boolean;

  // TMDB genre ids confirmed in the genres step.
  @Column('int', { array: true })
  genreIds: GenreId[];

  // The four taste-question answers: a side value or 'both' per axis.
  @Column({ type: 'varchar' })
  era: EraAnswer;

  @Column({ type: 'varchar' })
  reality: RealityAnswer;

  @Column({ type: 'varchar' })
  tasteAuthority: AuthorityAnswer;

  @Column({ type: 'varchar' })
  commitment: CommitmentAnswer;

  @Column('text', { array: true })
  avoid: string[];

  @Column('int')
  exploreLevel: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
