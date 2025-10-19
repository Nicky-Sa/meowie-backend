import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { generateSalt, hashPassword } from '../utils/hasher';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async create(dto: CreateUserDto): Promise<User> {
    try {
      const user = new User();
      const { email, password } = dto;

      const salt = generateSalt();
      const hashedPassword = await hashPassword(password, salt);

      user.email = email;
      user.hashedPassword = hashedPassword;
      user.salt = salt;

      return this.usersRepository.save(user);
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
