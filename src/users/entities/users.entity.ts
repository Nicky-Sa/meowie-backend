import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { LibraryItem } from '../../library/entities/library-item.entity';

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

  @OneToMany(() => LibraryItem, (item) => item.user)
  libraryItems: LibraryItem[];
}
