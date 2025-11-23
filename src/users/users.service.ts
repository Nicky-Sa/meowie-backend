import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User } from './users.entity';
import { RequestOtpReqDto } from '../auth/dto/request-otp.dto';

type FindOneBy =
  | { key: 'email'; value: string | null }
  | { key: 'id'; value: number | null };

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneBy({ key, value }: FindOneBy): Promise<User | null> {
    try {
      return await this.usersRepository.findOneByOrFail({ [key]: value }); // it's using findOneByOrFail to catch cases where id is undefined
    } catch {
      return null;
    }
  }

  async create(dto: RequestOtpReqDto): Promise<User> {
    try {
      const user = new User();
      user.email = dto.email;
      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(`Error creating user: ${error}`);
    }
  }

  async update(id: number, updatedProps: Partial<User>): Promise<UpdateResult> {
    return this.usersRepository.update({ id }, updatedProps);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
