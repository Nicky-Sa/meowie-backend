import {
  Check,
  Column,
  Entity,
  Generated,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { StoredSourceProgress } from '@/feed/engine/source/source.types';
import { MediaType } from '@/types/media-type';
import { User } from '@/user/entities/users.entity';

@Entity('feeds')
@Unique(['userId', 'mediaType'])
@Unique(['deviceCode', 'mediaType'])
@Check(
  '("userId" IS NOT NULL AND "deviceCode" IS NULL) OR ("userId" IS NULL AND "deviceCode" IS NOT NULL)',
)
export class Feed {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  userId: number | null;

  @Column({ type: 'uuid', nullable: true })
  deviceCode: string | null;

  @Column()
  mediaType: MediaType;

  @Column({ type: 'uuid' })
  @Generated('uuid')
  inputId: string;

  @Column({ type: 'jsonb' })
  sources: StoredSourceProgress;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  user: User | null;
}
