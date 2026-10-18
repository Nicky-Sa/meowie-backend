import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ExploreTabSources } from '@/explore/explore.types';

@Entity('explore_tabs')
export class ExploreTab {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'int' })
  position: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb' })
  sources: ExploreTabSources;
}
