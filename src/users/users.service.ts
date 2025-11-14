import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User } from './users.entity';
import { RequestOtpReqDto } from '../auth/dto/request-otp.dto';

type FindOneBy = { key: 'email'; value: string } | { key: 'id'; value: number };

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOneBy({ key, value }: FindOneBy): Promise<User | null> {
    return this.usersRepository.findOneBy({ [key]: value });
  }

  async create(dto: RequestOtpReqDto): Promise<User> {
    try {
      const user = new User();
      user.email = dto.email;
      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }

  async update(id: number, updatedProps: Partial<User>): Promise<UpdateResult> {
    return this.usersRepository.update({ id }, updatedProps);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
