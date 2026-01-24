import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'otp',
})
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  otp: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
