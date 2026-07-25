import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { User } from '@/user/entities/users.entity';
import { GenreId } from '@/taste/constants/pools.constant';
import {
  AuthorityAnswer,
  AvoidId,
  CommitmentAnswer,
  EraAnswer,
  RealityAnswer,
} from '@/taste/constants/journey.constant';

@Entity('taste')
@Unique(['userId'])
export class Taste {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column('int', { array: true })
  movieIds: number[];

  @Column('int', { array: true })
  seriesIds: number[];

  @Column()
  seriesSkipped: boolean;

  @Column('int', { array: true })
  genreIds: GenreId[];

  @Column({ type: 'varchar' })
  era: EraAnswer;

  @Column({ type: 'varchar' })
  reality: RealityAnswer;

  @Column({ type: 'varchar' })
  authority: AuthorityAnswer;

  @Column({ type: 'varchar' })
  commitment: CommitmentAnswer;

  @Column('text', { array: true })
  avoid: AvoidId[];

  @Column('int')
  exploreLevel: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
