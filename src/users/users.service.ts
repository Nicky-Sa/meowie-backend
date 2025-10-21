import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { OtpService } from '../otp/otp.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private otpService: OtpService,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async create(dto: CreateUserDto): Promise<string> {
    try {
      const user = new User();

      user.email = dto.email;
      return await this.otpService.generateOtp(user.email);
    } catch (error) {
      throw new Error(`Error creating user: ${error}`);
    }
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
