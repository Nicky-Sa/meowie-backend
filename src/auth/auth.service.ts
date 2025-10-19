import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}
  signUp(dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  signIn(username: string, pass: string) {
    return { username, pass };
  }
}
