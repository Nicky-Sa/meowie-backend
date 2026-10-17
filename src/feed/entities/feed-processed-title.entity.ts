import {
  Check,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Feed } from '@/feed/entities/feed.entity';

@Entity('feed_processed_titles')
@Index(['feedId', 'isDelivered', 'position'], {
  where: '"position" IS NOT NULL',
})
@Check('"position" IS NOT NULL OR "isDelivered" = false')
export class FeedProcessedTitle {
  @PrimaryColumn({ type: 'int' })
  feedId: number;

  @PrimaryColumn({ type: 'int' })
  tmdbId: number;

  /** Titles with no position were processed but not accepted for the feed. */
  @Column({ type: 'int', nullable: true })
  position: number | null;

  @Column({ default: false })
  isDelivered: boolean;

  @ManyToOne(() => Feed, { onDelete: 'CASCADE' })
  feed: Feed;
}
