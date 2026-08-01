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
import {
  AuthorityAnswer,
  AvoidId,
  CommitmentAnswer,
  EraAnswer,
  RealityAnswer,
  TitleRatings,
} from '@/taste/constants/journey.constant';

@Entity('taste')
@Unique(['userId'])
export class Taste {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column('jsonb')
  movieRatings: TitleRatings;

  @Column('jsonb')
  seriesRatings: TitleRatings;

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
