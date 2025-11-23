import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}
