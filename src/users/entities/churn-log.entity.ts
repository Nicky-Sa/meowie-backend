import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ChurnReasonId } from '../../constants/items/churn-reasons.constant';

@Entity({
  name: 'churn_log',
})
export class ChurnLog {
  @PrimaryGeneratedColumn()
  id: number;

  // Store as a simple string.
  // The DTO ensures only valid strings get here.
  @Column()
  reason: ChurnReasonId;

  @Column({ nullable: true })
  userTenureInDays: number; // How long they stayed

  @CreateDateColumn()
  createdAt: Date;
}
