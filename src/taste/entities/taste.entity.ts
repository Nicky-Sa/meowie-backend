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
import { FlexibilityOptionId } from '@/taste/constants/flexibility-options.constant';

export type KeywordId = `${string}_${number}`;

@Entity('taste')
@Unique(['userId'])
export class Taste {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userId: number;

  @Column('text', { array: true })
  keywords: KeywordId[];

  @Column({ type: 'varchar' })
  flexibility: FlexibilityOptionId;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
