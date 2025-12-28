import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Bookmark } from '../../movie-states/entities/bookmark.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks: Bookmark[];
}
