import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Saved } from '../../movie-states/entities/saved.entity';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    nullable: true,
    default: null,
    type: String,
    select: false,
  })
  hashedRefreshToken: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => Saved, (saved) => saved.user)
  saved: Saved[];
}
