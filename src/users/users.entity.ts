import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  hashedPassword: string;

  @Column()
  salt: string;

  @Column({ default: true })
  isActive: boolean;
}
