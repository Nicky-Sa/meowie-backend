import {
  Check,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Feed } from '@/feed/entities/feed.entity';
import { TitleOrigin } from '@/feed/engine/source/source.types';

@Entity('feed_processed_titles')
@Index(['feedId', 'isDelivered'], {
  where: '"isAccepted" = true',
})
@Check('"isAccepted" = true OR "isDelivered" = false')
export class FeedProcessedTitle {
  @PrimaryColumn({ type: 'int' })
  feedId: number;

  @PrimaryColumn({ type: 'int' })
  tmdbId: number;

  @Column({ default: false })
  isAccepted: boolean;

  @Column({ default: false })
  isDelivered: boolean;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  origins: TitleOrigin[];

  @ManyToOne(() => Feed, { onDelete: 'CASCADE' })
  feed: Feed;
}
