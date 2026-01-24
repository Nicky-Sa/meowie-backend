import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity({
  name: 'otp',
})
@Unique(['email'])
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  otp: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
